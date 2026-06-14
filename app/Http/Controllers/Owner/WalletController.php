<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\OwnerWalletTransaction;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $period = $request->input('period', 'monthly');
        $date = $request->input('date', today()->toDateString());

        $baseQuery = OwnerWalletTransaction::where('store_id', $storeId)
            ->with('user');

        switch ($period) {
            case 'weekly':
                $baseQuery = $baseQuery->whereBetween('transacted_at', [
                    now()->parse($date)->startOfWeek(),
                    now()->parse($date)->endOfWeek(),
                ]);
                break;
            case 'daily':
                $baseQuery = $baseQuery->whereDate('transacted_at', $date);
                break;
            default:
                $baseQuery = $baseQuery
                    ->whereMonth('transacted_at', now()->parse($date)->month)
                    ->whereYear('transacted_at', now()->parse($date)->year);
                break;
        }

        $allInPeriod = (clone $baseQuery)->get();

        $balance = OwnerWalletTransaction::balanceForStore($storeId);

        $summary = [
            'balance' => $balance,
            'period_in' => $allInPeriod->where('flow', 'in')->sum('amount'),
            'period_out' => $allInPeriod->where('flow', 'out')->sum('amount'),
            'count' => $allInPeriod->count(),
        ];

        $transactions = (clone $baseQuery)
            ->latest('transacted_at')
            ->paginate(20)
            ->through(fn($t) => [
                'id' => $t->id,
                'flow' => $t->flow,
                'source' => $t->source,
                'amount' => $t->amount,
                'description' => $t->description,
                'notes' => $t->notes,
                'transacted_at' => $t->transacted_at?->toDateString(),
                'created_by' => $t->user?->name,
                'expense_id' => $t->expense_id,
            ])
            ->withQueryString();

        return Inertia::render('owner/wallet/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date']),
        ]);
    }

    public function create()
    {
        return Inertia::render('owner/wallet/create/page');
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
            'transacted_at' => ['required', 'date'],
        ]);

        OwnerWalletTransaction::create([
            'store_id' => $storeId,
            'user_id' => auth()->id(),
            'flow' => 'in',
            'source' => 'manual_topup',
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'notes' => $validated['notes'] ?? null,
            'transacted_at' => $validated['transacted_at'],
        ]);

        return redirect()->route('owner.wallet')->with('success', 'Saldo berhasil ditambahkan ke dompet.');
    }

    public function storeSpend(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
            'transacted_at' => ['required', 'date'],
        ]);

        $balance = OwnerWalletTransaction::balanceForStore($storeId);

        if ($validated['amount'] > $balance) {
            return back()->withErrors(['amount' => 'Jumlah melebihi saldo dompet.']);
        }

        OwnerWalletTransaction::create([
            'store_id' => $storeId,
            'user_id' => auth()->id(),
            'flow' => 'out',
            'source' => 'personal_out',
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'notes' => $validated['notes'] ?? null,
            'transacted_at' => $validated['transacted_at'],
        ]);

        return redirect()->route('owner.wallet')->with('success', 'Pengeluaran berhasil dicatat.');
    }

    public function storeSendToStore(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
            'transacted_at' => ['required', 'date'],
        ]);

        $balance = OwnerWalletTransaction::balanceForStore($storeId);

        if ($validated['amount'] > $balance) {
            return back()->withErrors(['amount' => 'Jumlah melebihi saldo dompet.']);
        }

        DB::transaction(function () use ($validated, $storeId) {
            OwnerWalletTransaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'flow' => 'out',
                'source' => 'store_transfer',
                'amount' => $validated['amount'],
                'description' => $validated['description'],
                'notes' => $validated['notes'] ?? null,
                'transacted_at' => $validated['transacted_at'],
            ]);

            Expense::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'type' => 'store_transfer_in',
                'payment_source' => 'dine_in',
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'expensed_at' => $validated['transacted_at'],
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Saldo berhasil dikirim ke kas toko (Dine In).');
    }
    public function edit(OwnerWalletTransaction $walletTransaction)
    {
        abort_if($walletTransaction->store_id !== auth()->user()->store_id, 403);

        if ($walletTransaction->source === 'withdrawal' && $walletTransaction->expense_id) {
            return redirect()->route('owner.expenses')
                ->with('info', 'Transaksi dari penarikan toko hanya bisa diedit dari halaman Pengeluaran.');
        }

        $currentBalance = OwnerWalletTransaction::balanceForStore(auth()->user()->store_id);

        return Inertia::render('owner/wallet/edit/page', [
            'transaction' => [
                'id' => $walletTransaction->id,
                'amount' => $walletTransaction->amount,
                'description' => $walletTransaction->description,
                'notes' => $walletTransaction->notes,
                'transacted_at' => $walletTransaction->transacted_at?->toDateString(),
                'flow' => $walletTransaction->flow,
                'source' => $walletTransaction->source,
            ],
            'currentBalance' => $currentBalance,
        ]);
    }

    public function update(Request $request, OwnerWalletTransaction $walletTransaction)
    {
        abort_if($walletTransaction->store_id !== auth()->user()->store_id, 403);

        if ($walletTransaction->source === 'withdrawal' && $walletTransaction->expense_id) {
            return redirect()->route('owner.expenses')
                ->with('info', 'Transaksi dari penarikan toko hanya bisa diedit dari halaman Pengeluaran.');
        }

        $validated = $request->validate([
            'description' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
            'transacted_at' => ['required', 'date'],
        ]);

        $walletTransaction->update($validated);

        return redirect()->route('owner.wallet')->with('success', 'Transaksi berhasil diupdate.');
    }

    public function destroy(OwnerWalletTransaction $walletTransaction)
    {
        abort_if($walletTransaction->store_id !== auth()->user()->store_id, 403);

        if ($walletTransaction->source === 'withdrawal' && $walletTransaction->expense_id) {
            return redirect()->route('owner.expenses')
                ->with('info', 'Transaksi dari penarikan toko hanya bisa dihapus dari halaman Pengeluaran.');
        }

        if ($walletTransaction->source === 'store_transfer') {
            return back()->withErrors(['error' => 'Transfer ke toko tidak bisa dihapus langsung.']);
        }

        $walletTransaction->forceDelete();

        return back()->with('success', 'Entri dompet berhasil dihapus.');
    }
}