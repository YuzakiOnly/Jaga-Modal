<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierHistoryController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $period = $request->input('period', 'daily');
        $date = $request->input('date', today()->toDateString());

        $summaryQuery = Transaction::forStore($storeId)->completed();

        $parsedDate = now()->parse($date);

        $summaryQuery = match ($period) {
            'weekly' => $summaryQuery->whereBetween('transacted_at', [
                $parsedDate->copy()->startOfWeek(),
                $parsedDate->copy()->endOfWeek(),
            ]),
            'monthly' => $summaryQuery
                ->whereMonth('transacted_at', $parsedDate->month)
                ->whereYear('transacted_at', $parsedDate->year),
            default => $summaryQuery->whereDate('transacted_at', $parsedDate),
        };

        $summary = [
            'total_revenue' => (float) (clone $summaryQuery)->sum('total'),
            'total_count' => (int) (clone $summaryQuery)->count(),
            'cash_count' => (int) (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (int) (clone $summaryQuery)->where('payment_method', 'qris')->count(),
            'unique_customer_count' => (int) (clone $summaryQuery)->whereNotNull('customer_id')->distinct('customer_id')->count('customer_id'),
        ];

        $transactions = (clone $summaryQuery)
            ->with(['items', 'items.product:id,image', 'customer:id,name,phone,customer_number'])
            ->latest('transacted_at')
            ->paginate(20)
            ->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'payment_method' => $transaction->payment_method,
                    'total' => (float) $transaction->total,
                    'subtotal' => (float) $transaction->subtotal,
                    'discount' => (float) $transaction->discount,
                    'amount_paid' => (float) $transaction->amount_paid,
                    'change_amount' => (float) $transaction->change_amount,
                    'notes' => $transaction->notes,
                    'transacted_at' => $transaction->transacted_at,
                    'customer_name' => $transaction->customer?->name,
                    'customer_phone' => $transaction->customer?->phone,
                    'customer_number' => $transaction->customer?->customer_number,
                    'items' => $transaction->items->map(fn($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                        'qty' => $item->qty,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                        'discount' => $item->discount,
                        'is_custom' => $item->is_custom,
                    ]),
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