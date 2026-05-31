<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\OwnerWalletTransaction;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $cashBalance = Transaction::forStore($storeId)
            ->completed()
            ->sum('total') - Expense::forStore($storeId)->sum('amount');

        $period = $request->input('period', 'daily');
        $date = $request->input('date', today()->toDateString());

        $baseQuery = Expense::where('store_id', $storeId)
            ->with('user')
            ->withTrashed();

        $baseQuery = match ($period) {
            'weekly' => $baseQuery->whereBetween('expensed_at', [
                now()->parse($date)->startOfWeek(),
                now()->parse($date)->endOfWeek(),
            ]),
            'monthly' => $baseQuery
                ->whereMonth('expensed_at', now()->parse($date)->month)
                ->whereYear('expensed_at', now()->parse($date)->year),
            default => $baseQuery->whereDate('expensed_at', $date),
        };

        $allExpenses = (clone $baseQuery)->get();

        $summary = [
            'total' => $allExpenses->sum(function ($e) {
                return $e->total_amount;
            }),
            'by_type' => [
                'simple' => $allExpenses->where('type', 'simple')->sum(function ($e) {
                    return $e->total_amount;
                }),
                'raw_material' => $allExpenses->where('type', 'raw_material')->sum(function ($e) {
                    return $e->total_amount;
                }),
                'salary' => $allExpenses->where('type', 'salary')->sum(function ($e) {
                    return $e->total_amount;
                }),
                'owner_withdrawal' => $allExpenses->where('type', 'owner_withdrawal')->sum(function ($e) {
                    return $e->total_amount;
                }),
            ],
            'count' => $allExpenses->count(),
        ];

        $expenses = (clone $baseQuery)
            ->latest('expensed_at')
            ->paginate(20)
            ->through(fn($expense) => $this->formatExpense($expense))
            ->withQueryString();

        return Inertia::render('owner/expenses/page', [
            'expenses' => $expenses,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date']),
            'storeCashBalance' => $cashBalance,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        // Hitung saldo kas saat ini
        $currentCashBalance = $this->getCurrentCashBalance($storeId);

        $validated = $this->validateByType($request);

        // Validasi saldo untuk semua tipe pengeluaran
        $amount = $this->getExpenseAmount($request->type, $validated);

        if ($amount > $currentCashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi. Saldo saat ini: Rp %s',
                    number_format($currentCashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        DB::transaction(function () use ($request, $validated, $storeId) {
            $data = $this->buildExpenseData($request->type, $validated, $storeId);
            $expense = Expense::create($data);

            if ($request->type === 'owner_withdrawal') {
                $amount = (float) $validated['amount'];

                OwnerWalletTransaction::create([
                    'store_id' => $storeId,
                    'user_id' => auth()->id(),
                    'flow' => 'in',
                    'source' => 'withdrawal',
                    'amount' => $amount,
                    'description' => 'Penarikan toko: ' . $validated['description'],
                    'notes' => $validated['notes'] ?? null,
                    'expense_id' => $expense->id,
                    'transacted_at' => $validated['expensed_at'],
                ]);
            }
        });

        return back()->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorizeStore($expense);

        $storeId = $expense->store_id;

        // Hitung saldo kas sebelum update (tambahkan kembali pengeluaran lama)
        $currentCashBalance = $this->getCurrentCashBalance($storeId) + $expense->total_amount;

        $validated = $this->validateByType($request);

        // Validasi saldo untuk update
        $newAmount = $this->getExpenseAmount($request->type, $validated);

        if ($newAmount > $currentCashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi untuk update ini. Saldo saat ini (setelah mengembalikan pengeluaran lama Rp %s): Rp %s',
                    number_format($expense->total_amount, 0, ',', '.'),
                    number_format($currentCashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        DB::transaction(function () use ($request, $validated, $expense) {
            $oldType = $expense->type;
            $oldAmount = $expense->total_amount;

            $data = $this->buildExpenseData($request->type, $validated, $expense->store_id, isUpdate: true);
            $expense->update($data);

            $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();

            if ($request->type === 'owner_withdrawal') {
                $newAmount = (float) $validated['amount'];

                if ($walletEntry) {
                    $walletEntry->update([
                        'amount' => $newAmount,
                        'description' => 'Penarikan toko: ' . $validated['description'],
                        'notes' => $validated['notes'] ?? null,
                        'transacted_at' => $validated['expensed_at'],
                    ]);
                } else {
                    OwnerWalletTransaction::create([
                        'store_id' => $expense->store_id,
                        'user_id' => auth()->id(),
                        'flow' => 'in',
                        'source' => 'withdrawal',
                        'amount' => $newAmount,
                        'description' => 'Penarikan toko: ' . $validated['description'],
                        'notes' => $validated['notes'] ?? null,
                        'expense_id' => $expense->id,
                        'transacted_at' => $validated['expensed_at'],
                    ]);
                }
            } else {
                if ($walletEntry && $walletEntry->source === 'withdrawal') {
                    $walletEntry->forceDelete();
                }
            }
        });

        return back()->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $expense)
    {
        $this->authorizeStore($expense);

        DB::transaction(function () use ($expense) {
            $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();
            if ($walletEntry && $walletEntry->source === 'withdrawal') {
                $walletEntry->forceDelete();
            }
            $expense->forceDelete();
        });

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }

    /**
     * Hitung saldo kas toko saat ini
     */
    private function getCurrentCashBalance(int $storeId): float
    {
        $totalIncome = Transaction::forStore($storeId)
            ->completed()
            ->sum('total');

        $totalExpenses = Expense::forStore($storeId)->sum('amount');

        return $totalIncome - $totalExpenses;
    }

    /**
     * Dapatkan jumlah pengeluaran berdasarkan tipe
     */
    private function getExpenseAmount(string $type, array $validated): float
    {
        if ($type === 'raw_material') {
            return (float) ($validated['quantity'] * $validated['unit_price']);
        }

        return (float) ($validated['amount'] ?? 0);
    }

    private function validateByType(Request $request): array
    {
        $rules = [
            'type' => ['required', 'in:simple,raw_material,salary,owner_withdrawal'],
            'description' => ['required', 'string', 'max:200'],
            'expensed_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];

        if ($request->type === 'raw_material') {
            $rules['quantity'] = ['required', 'numeric', 'min:0.01'];
            $rules['unit_price'] = ['required', 'numeric', 'min:0.01'];
        } elseif ($request->type === 'salary') {
            $rules['employee_name'] = ['required', 'string', 'max:100'];
            $rules['salary_period'] = ['required', 'string', 'max:50'];
            $rules['amount'] = ['required', 'numeric', 'min:1'];
        } elseif ($request->type === 'owner_withdrawal') {
            $rules['amount'] = ['required', 'numeric', 'min:1'];
        } else {
            $rules['amount'] = ['required', 'numeric', 'min:1'];
        }

        return $request->validate($rules);
    }

    private function buildExpenseData(string $type, array $validated, int $storeId, bool $isUpdate = false): array
    {
        $data = [
            'store_id' => $storeId,
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'description' => $validated['description'],
            'expensed_at' => $validated['expensed_at'],
            'notes' => $validated['notes'] ?? null,
        ];

        if ($isUpdate) {
            unset($data['store_id'], $data['user_id']);
        }

        if ($type === 'raw_material') {
            $data['quantity'] = $validated['quantity'];
            $data['unit_price'] = $validated['unit_price'];
            $data['amount'] = $validated['quantity'] * $validated['amount'];
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        } elseif ($type === 'salary') {
            $data['employee_name'] = $validated['employee_name'];
            $data['salary_period'] = $validated['salary_period'];
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
        } elseif ($type === 'owner_withdrawal') {
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        } else {
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        }

        return $data;
    }

    private function authorizeStore(Expense $expense): void
    {
        abort_if($expense->store_id !== auth()->user()->store_id, 403);
    }

    private function formatExpense($expense): array
    {
        return [
            'id' => $expense->id,
            'type' => $expense->type,
            'description' => $expense->description,
            'amount' => $expense->total_amount,
            'quantity' => $expense->quantity,
            'unit_price' => $expense->unit_price,
            'employee_name' => $expense->employee_name,
            'salary_period' => $expense->salary_period,
            'notes' => $expense->notes,
            'expensed_at' => $expense->expensed_at?->toDateString(),
            'created_by' => $expense->user?->name,
            'deleted_at' => $expense->deleted_at,
        ];
    }
}