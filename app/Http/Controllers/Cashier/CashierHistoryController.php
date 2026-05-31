<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierHistoryController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $period = $request->input('period', 'daily');
        $date = $request->input('date', today()->toDateString());

        $summaryQuery = Transaction::forStore($storeId)->completed();

        $summaryQuery = match ($period) {
            'weekly' => $summaryQuery->whereBetween('transacted_at', [
                now()->parse($date)->startOfWeek(),
                now()->parse($date)->endOfWeek(),
            ]),
            'monthly' => $summaryQuery
                ->whereMonth('transacted_at', now()->parse($date)->month)
                ->whereYear('transacted_at', now()->parse($date)->year),
            default => $summaryQuery->whereDate('transacted_at', $date),
        };

        $summary = [
            'total_revenue' => 'Rp ' . number_format((clone $summaryQuery)->sum('total'), 0, ',', '.'),
            'total_count' => (clone $summaryQuery)->count(),
            'cash_count' => (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (clone $summaryQuery)->where('payment_method', 'qris')->count(),
        ];

        $transactions = (clone $summaryQuery)
            ->with(['items', 'items.product:id,image'])
            ->latest('transacted_at')
            ->paginate(20)
            ->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'payment_method' => $transaction->payment_method,
                    'total' => $transaction->total,
                    'subtotal' => $transaction->subtotal,
                    'discount' => $transaction->discount,
                    'amount_paid' => $transaction->amount_paid,
                    'change_amount' => $transaction->change_amount,
                    'transacted_at' => $transaction->transacted_at,
                    'items' => $transaction->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'qty' => $item->qty,
                            'unit_price' => $item->unit_price,
                            'subtotal' => $item->subtotal,
                            'discount' => $item->discount,
                        ];
                    }),
                ];
            })
            ->withQueryString();

        return Inertia::render('cashier/history/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date']),
        ]);
    }
}