<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CashierHistoryController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        // Ambil parameter filter
        $period = $request->input('period', 'daily');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $date = $request->input('date', today()->toDateString());

        $summaryQuery = Transaction::forStore($storeId)->completed();

        // 🔥 PRIORITAS: Gunakan range jika tersedia
        if ($dateFrom && $dateTo) {
            $parsedFrom = Carbon::parse($dateFrom)->startOfDay();
            $parsedTo = Carbon::parse($dateTo)->endOfDay();

            $summaryQuery->whereBetween('transacted_at', [$parsedFrom, $parsedTo]);
        }
        // 🔥 FALLBACK: Gunakan period + single date
        else {
            $parsedDate = Carbon::parse($date);

            switch ($period) {
                case 'weekly':
                    $start = $parsedDate->copy()->startOfWeek();
                    $end = $parsedDate->copy()->endOfWeek();
                    $summaryQuery->whereBetween('transacted_at', [$start, $end]);
                    break;
                case 'monthly':
                    $summaryQuery
                        ->whereMonth('transacted_at', $parsedDate->month)
                        ->whereYear('transacted_at', $parsedDate->year);
                    break;
                default: // daily
                    $summaryQuery->whereDate('transacted_at', $parsedDate);
            }
        }

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
                        'unit_price' => (float) $item->unit_price,
                        'subtotal' => (float) $item->subtotal,
                        'discount' => (float) $item->discount,
                        'is_custom' => $item->is_custom,
                        'variant_details' => $item->variant_details ? json_decode($item->variant_details, true) : null,
                    ]),
                ];
            })
            ->withQueryString();

        return Inertia::render('cashier/history/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date', 'date_from', 'date_to']),
        ]);
    }
}