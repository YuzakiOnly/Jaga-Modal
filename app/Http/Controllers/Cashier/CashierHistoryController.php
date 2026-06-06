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
        $channel = $request->input('channel');

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

        if ($channel) {
            $summaryQuery->where('order_channel', $channel);
        }

        $revenueByChannel = (clone $summaryQuery)
            ->select('order_channel', DB::raw('SUM(net_revenue) as net_revenue'))
            ->groupBy('order_channel')
            ->get()
            ->mapWithKeys(fn($item) => [
                $item->order_channel => (float) $item->net_revenue,
            ])
            ->toArray();

        $summary = [
            'total_revenue' => (float) (clone $summaryQuery)->sum('total'),
            'total_net_revenue' => (float) (clone $summaryQuery)->sum('net_revenue'),
            'total_platform_fee' => (float) (clone $summaryQuery)->sum('platform_fee'),
            'total_count' => (int) (clone $summaryQuery)->count(),
            'cash_count' => (int) (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (int) (clone $summaryQuery)->where('payment_method', 'qris')->count(),
            'grabfood_count' => (int) (clone $summaryQuery)->where('order_channel', 'grabfood')->count(),
            'shopeefood_count' => (int) (clone $summaryQuery)->where('order_channel', 'shopeefood')->count(),
            'gobiz_count' => (int) (clone $summaryQuery)->where('order_channel', 'gobiz')->count(),
            'revenue_by_channel' => $revenueByChannel,
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
                    'order_channel' => $transaction->order_channel ?? 'dine_in',
                    'total' => (float) $transaction->total,
                    'subtotal' => (float) $transaction->subtotal,
                    'discount' => (float) $transaction->discount,
                    'platform_fee' => (float) $transaction->platform_fee,
                    'net_revenue' => (float) $transaction->net_revenue,
                    'amount_paid' => (float) $transaction->amount_paid,
                    'change_amount' => (float) $transaction->change_amount,
                    'notes' => $transaction->notes,
                    'transacted_at' => $transaction->transacted_at,
                    'customer_name' => $transaction->customer ? $transaction->customer->name : null,
                    'customer_phone' => $transaction->customer ? $transaction->customer->phone : null,
                    'customer_number' => $transaction->customer ? $transaction->customer->customer_number : null,
                    'items' => $transaction->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'qty' => $item->qty,
                            'unit_price' => $item->unit_price,
                            'subtotal' => $item->subtotal,
                            'discount' => $item->discount,
                            'is_custom' => $item->is_custom,
                        ];
                    }),
                ];
            })
            ->withQueryString();

        return Inertia::render('cashier/history/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date', 'channel']),
            'online_channels' => Transaction::ONLINE_CHANNELS,
        ]);
    }
}