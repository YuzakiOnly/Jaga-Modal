<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\OwnerWalletTransaction;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $cashBalance = Store::computeCashBalance($storeId);

        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $baseQuery = Expense::where('store_id', $storeId)
            ->with('user')
            ->withTrashed();

        // Handle date range filter
        if ($dateFrom && $dateTo) {
            $baseQuery = $baseQuery->whereBetween('expensed_at', [
                $dateFrom . ' 00:00:00',
                $dateTo . ' 23:59:59'
            ]);
        } elseif ($dateFrom) {
            $baseQuery = $baseQuery->whereDate('expensed_at', $dateFrom);
        } else {
            // Default: bulan ini
            $baseQuery = $baseQuery
                ->whereMonth('expensed_at', now()->month)
                ->whereYear('expensed_at', now()->year);
        }

        $allExpenses = (clone $baseQuery)->get();

        $summary = [
            'total' => $allExpenses->sum('amount'),
            'by_type' => [
                'simple' => $allExpenses->where('type', 'simple')->sum('amount'),
                'raw_material' => $allExpenses->where('type', 'raw_material')->sum('amount'),
                'salary' => $allExpenses->where('type', 'salary')->sum('amount'),
                'owner_withdrawal' => $allExpenses->where('type', 'owner_withdrawal')->sum('amount'),
                'store_transfer_in' => $allExpenses->where('type', 'store_transfer_in')->sum('amount'),
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
            'filters' => $request->only(['date_from', 'date_to']),
            'cash_balance' => $cashBalance,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $cashBalance = Store::computeCashBalance($storeId);

        $validated = $this->validateByType($request);
        $amount = $this->getExpenseAmount($request->type, $validated);

        if ($request->type !== 'store_transfer_in' && $amount > $cashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi. Saldo saat ini: Rp %s',
                    number_format($cashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        DB::transaction(function () use ($request, $validated, $storeId) {
            $data = $this->buildExpenseData($request->type, $validated, $storeId);
            $expense = Expense::create($data);

            if ($request->type === 'owner_withdrawal') {
                OwnerWalletTransaction::create([
                    'store_id' => $storeId,
                    'user_id' => auth()->id(),
                    'flow' => 'in',
                    'source' => 'withdrawal',
                    'amount' => (float) $validated['amount'],
                    'description' => 'Penarikan toko: ' . $validated['description'],
                    'notes' => $validated['notes'] ?? null,
                    'expense_id' => $expense->id,
                    'transacted_at' => $validated['expensed_at'],
                ]);
            }
        });

        return back()->with('success', 'Transaksi berhasil dicatat.');
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorizeStore($expense);

        $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();

        if ($expense->type === 'store_transfer_in' && $walletEntry) {
            return back()->withErrors([
                'error' => 'Transfer masuk dari wallet tidak dapat diedit di sini. Silahkan edit dari halaman Wallet.'
            ]);
        }

        $storeId = $expense->store_id;
        $currentCashBalance = Store::computeCashBalance($storeId) + $expense->amount;

        $validated = $this->validateByType($request);
        $newAmount = $this->getExpenseAmount($request->type, $validated);

        if ($request->type !== 'store_transfer_in' && $newAmount > $currentCashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi untuk update ini. Saldo saat ini (setelah mengembalikan pengeluaran lama Rp %s): Rp %s',
                    number_format($expense->amount, 0, ',', '.'),
                    number_format($currentCashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        DB::transaction(function () use ($request, $validated, $expense) {
            $data = $this->buildExpenseData($request->type, $validated, $expense->store_id, true);
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
            } elseif ($request->type === 'store_transfer_in') {
                $newAmount = (float) $validated['amount'];

                if ($walletEntry) {
                    $walletEntry->update([
                        'amount' => $newAmount,
                        'flow' => 'out',
                        'source' => 'store_transfer',
                        'description' => $validated['description'],
                        'notes' => $validated['notes'] ?? null,
                        'transacted_at' => $validated['expensed_at'],
                    ]);
                } else {
                    OwnerWalletTransaction::create([
                        'store_id' => $expense->store_id,
                        'user_id' => auth()->id(),
                        'flow' => 'out',
                        'source' => 'store_transfer',
                        'amount' => $newAmount,
                        'description' => 'Transfer ke toko: ' . $validated['description'],
                        'notes' => $validated['notes'] ?? null,
                        'expense_id' => $expense->id,
                        'transacted_at' => $validated['expensed_at'],
                    ]);
                }
            } else {
                if ($walletEntry && in_array($walletEntry->source, ['withdrawal', 'store_transfer'])) {
                    $walletEntry->forceDelete();
                }
            }
        });

        return back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Expense $expense)
    {
        $this->authorizeStore($expense);

        $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();

        if ($expense->type === 'store_transfer_in' && $walletEntry) {
            return back()->withErrors([
                'error' => 'Transfer masuk dari wallet tidak dapat dihapus di sini. Silahkan hapus dari halaman Wallet.'
            ]);
        }

        DB::transaction(function () use ($expense) {
            $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();
            if ($walletEntry && in_array($walletEntry->source, ['withdrawal', 'store_transfer'])) {
                $walletEntry->forceDelete();
            }
            $expense->forceDelete();
        });

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }

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
            'type' => ['required', 'in:simple,raw_material,salary,owner_withdrawal,store_transfer_in'],
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
        } elseif (in_array($request->type, ['owner_withdrawal', 'store_transfer_in'])) {
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
            $data['amount'] = $validated['quantity'] * $validated['unit_price'];
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        } elseif ($type === 'salary') {
            $data['employee_name'] = $validated['employee_name'];
            $data['salary_period'] = $validated['salary_period'];
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
        } elseif (in_array($type, ['owner_withdrawal', 'store_transfer_in'])) {
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
        $walletEntry = OwnerWalletTransaction::where('expense_id', $expense->id)->first();

        $isFromWallet = false;
        $walletDescription = null;
        $walletNotes = null;

        if ($expense->type === 'store_transfer_in' && $walletEntry && $walletEntry->source === 'store_transfer') {
            $isFromWallet = true;
            $walletDescription = $walletEntry->description;
            $walletNotes = $walletEntry->notes;
        }

        return [
            'id' => $expense->id,
            'type' => $expense->type,
            'description' => $expense->description,
            'amount' => $expense->amount,
            'quantity' => $expense->quantity,
            'unit_price' => $expense->unit_price,
            'employee_name' => $expense->employee_name,
            'salary_period' => $expense->salary_period,
            'notes' => $expense->notes,
            'expensed_at' => $expense->expensed_at?->toDateString(),
            'created_by' => $expense->user?->name,
            'deleted_at' => $expense->deleted_at,
            'is_from_wallet' => $isFromWallet,
            'wallet_description' => $walletDescription,
            'wallet_notes' => $walletNotes,
        ];
    }
}