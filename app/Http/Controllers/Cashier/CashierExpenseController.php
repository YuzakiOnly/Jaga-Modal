<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierExpenseController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $date = $request->input('date', today()->toDateString());

        $cashBalance = Store::computeCashBalance($storeId);

        $expenses = Expense::where('store_id', $storeId)
            ->where('type', '!=', 'store_transfer_in')
            ->whereDate('expensed_at', $date)
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($expense) {
                return [
                    'id' => $expense->id,
                    'description' => $expense->description,
                    'type' => $expense->type,
                    'amount' => (float) $expense->total_amount,
                    'quantity' => $expense->quantity,
                    'unit_price' => $expense->unit_price,
                    'employee_name' => $expense->employee_name,
                    'salary_period' => $expense->salary_period,
                    'notes' => $expense->notes,
                    'created_at' => $expense->created_at,
                    'expensed_at' => $expense->expensed_at,
                ];
            });

        $totalExpense = Expense::where('store_id', $storeId)
            ->where('type', '!=', 'store_transfer_in')
            ->whereDate('expensed_at', $date)
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $summary = [
            'total' => (float) $totalExpense,
            'count' => $expenses->total(),
        ];

        return Inertia::render('cashier/expenses/page', [
            'expenses' => $expenses,
            'summary' => $summary,
            'filters' => ['date' => $date],
            'storeCashBalance' => (float) $cashBalance,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;
        $userRole = auth()->user()->role;

        $rules = [
            'type' => ['required', 'in:simple,raw_material,salary,owner_withdrawal'],
            'description' => ['required', 'string', 'max:200'],
            'expensed_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];

        if ($request->type === 'owner_withdrawal' && $userRole !== 'owner') {
            return back()->withErrors(['type' => 'Hanya owner yang dapat melakukan penarikan.']);
        }

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

        $validated = $request->validate($rules);

        $expenseAmount = $this->getExpenseAmount($request->type, $validated);

        $cashBalance = Store::computeCashBalance($storeId);

        if ($expenseAmount > $cashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi. Saldo saat ini: Rp %s',
                    number_format($cashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        $data = [
            'store_id' => $storeId,
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'description' => $validated['description'],
            'expensed_at' => $validated['expensed_at'],
            'notes' => $validated['notes'] ?? null,
        ];

        if ($request->type === 'raw_material') {
            $data['quantity'] = $validated['quantity'];
            $data['unit_price'] = $validated['unit_price'];
            $data['amount'] = $validated['quantity'] * $validated['unit_price'];
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        } elseif ($request->type === 'salary') {
            $data['employee_name'] = $validated['employee_name'];
            $data['salary_period'] = $validated['salary_period'];
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
        } elseif ($request->type === 'owner_withdrawal') {
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

        Expense::create($data);

        return back()->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function update(Request $request, Expense $expense)
    {
        $user = auth()->user();
        $storeId = $user->store_id;

        abort_if($expense->store_id !== $storeId, 403);

        if ($user->role !== 'owner' && $expense->user_id !== $user->id) {
            abort(403, 'Anda tidak dapat mengedit pengeluaran orang lain.');
        }

        $rules = [
            'type' => ['required', 'in:simple,raw_material,salary,owner_withdrawal'],
            'description' => ['required', 'string', 'max:200'],
            'expensed_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];

        if ($request->type === 'owner_withdrawal' && $user->role !== 'owner') {
            return back()->withErrors(['type' => 'Hanya owner yang dapat melakukan penarikan.']);
        }

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

        $validated = $request->validate($rules);

        $newExpenseAmount = $this->getExpenseAmount($request->type, $validated);

        $currentCashBalance = Store::computeCashBalance($storeId) + $expense->total_amount;

        if ($newExpenseAmount > $currentCashBalance) {
            return back()->withErrors([
                'amount' => sprintf(
                    'Saldo kas toko tidak mencukupi untuk update ini. Saldo saat ini (setelah mengembalikan pengeluaran lama Rp %s): Rp %s',
                    number_format($expense->total_amount, 0, ',', '.'),
                    number_format($currentCashBalance, 0, ',', '.')
                )
            ])->withInput();
        }

        $data = [
            'type' => $validated['type'],
            'description' => $validated['description'],
            'expensed_at' => $validated['expensed_at'],
            'notes' => $validated['notes'] ?? null,
        ];

        if ($request->type === 'raw_material') {
            $data['quantity'] = $validated['quantity'];
            $data['unit_price'] = $validated['unit_price'];
            $data['amount'] = $validated['quantity'] * $validated['unit_price'];
            $data['employee_name'] = null;
            $data['salary_period'] = null;
        } elseif ($request->type === 'salary') {
            $data['employee_name'] = $validated['employee_name'];
            $data['salary_period'] = $validated['salary_period'];
            $data['amount'] = $validated['amount'];
            $data['quantity'] = null;
            $data['unit_price'] = null;
        } elseif ($request->type === 'owner_withdrawal') {
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

        $expense->update($data);

        return back()->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Expense $expense)
    {
        $user = auth()->user();
        $storeId = $user->store_id;

        abort_if($expense->store_id !== $storeId, 403);

        if ($user->role !== 'owner' && $expense->user_id !== $user->id) {
            abort(403, 'Anda tidak dapat menghapus pengeluaran orang lain.');
        }

        $expense->forceDelete();

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }

    private function getExpenseAmount(string $type, array $validated): float
    {
        if ($type === 'raw_material') {
            return (float) ($validated['quantity'] * $validated['unit_price']);
        }

        return (float) ($validated['amount'] ?? 0);
    }
}