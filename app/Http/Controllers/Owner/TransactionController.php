<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $products = Product::where('store_id', $storeId)
            ->where('is_active', true)
            ->with('category:id,name')
            ->orderBy('name')
            ->get([
                'id',
                'category_id',
                'name',
                'selling_price',
                'capital_price',
                'stock_type',
                'stock',
                'is_active',
                'image',
            ]);

        $categories = Category::where('store_id', $storeId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/pos/page', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return back()->with('error', 'Please setup your store first.');
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:cash,qris,grabfood,shopeefood,gobiz'],
            'order_channel' => ['required', 'in:dine_in,grabfood,shopeefood,gobiz'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'change_amount' => ['required', 'numeric', 'min:0'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'platform_fee' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
            'transacted_at' => ['nullable', 'date', 'before_or_equal:now'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:200'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.capital_price' => ['required', 'numeric', 'min:0'],
            'items.*.original_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.is_custom' => ['required', 'boolean'],
        ]);

        $onlineChannels = Transaction::ONLINE_CHANNELS;
        if (
            in_array($validated['order_channel'], $onlineChannels) &&
            $validated['payment_method'] !== $validated['order_channel']
        ) {
            return back()->withErrors([
                'payment_method' => 'Metode pembayaran harus sesuai dengan channel pesanan.',
            ])->withInput();
        }

        DB::transaction(function () use ($validated, $storeId) {
            $transactedAt = !empty($validated['transacted_at'])
                ? Carbon::parse($validated['transacted_at'])
                : now();

            $isOnline = in_array($validated['order_channel'], Transaction::ONLINE_CHANNELS);

            $platformFee = $validated['platform_fee'] ?? 0;

            $netRevenue = $validated['total'] - $platformFee;

            $transaction = Transaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'payment_method' => $validated['payment_method'],
                'order_channel' => $validated['order_channel'],
                'amount_paid' => $validated['amount_paid'],
                'change_amount' => $validated['change_amount'],
                'subtotal' => $validated['subtotal'],
                'discount' => $validated['discount'] ?? 0,
                'platform_fee' => $platformFee,
                'net_revenue' => $netRevenue,
                'total' => $validated['total'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
                'transacted_at' => $transactedAt,
            ]);

            foreach ($validated['items'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'name' => $item['name'],
                    'is_custom' => $item['is_custom'],
                    'unit_price' => $item['unit_price'],
                    'capital_price' => $item['capital_price'] ?? 0,
                    'qty' => $item['qty'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $item['subtotal'],
                ]);

                if (!$item['is_custom'] && $item['product_id']) {
                    Product::where('id', $item['product_id'])
                        ->where('stock_type', 'limited')
                        ->decrement('stock', $item['qty']);
                }
            }
        });

        return back()->with('success', 'Transaksi berhasil disimpan.');
    }

    public function history(Request $request)
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

        $summary = [
            'total_revenue' => (clone $summaryQuery)->sum('total'),
            'total_net_revenue' => (clone $summaryQuery)->sum('net_revenue'),
            'total_platform_fee' => (clone $summaryQuery)->sum('platform_fee'),
            'total_count' => (clone $summaryQuery)->count(),
            'cash_count' => (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (clone $summaryQuery)->where('payment_method', 'qris')->count(),
            'grabfood_count' => (clone $summaryQuery)->where('order_channel', 'grabfood')->count(),
            'shopeefood_count' => (clone $summaryQuery)->where('order_channel', 'shopeefood')->count(),
            'gobiz_count' => (clone $summaryQuery)->where('order_channel', 'gobiz')->count(),
            'revenue_by_channel' => (clone $summaryQuery)
                ->select('order_channel', DB::raw('SUM(total) as total_revenue'), DB::raw('SUM(net_revenue) as net_revenue'))
                ->groupBy('order_channel')
                ->get()
                ->mapWithKeys(fn($item) => [
                    $item->order_channel => [
                        'gross' => (float) $item->total_revenue,
                        'net' => (float) $item->net_revenue,
                    ]
                ]),
        ];

        $transactions = (clone $summaryQuery)
            ->with(['items', 'items.product:id,image'])
            ->latest('transacted_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('owner/pos/history/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['period', 'date', 'channel']),
            'online_channels' => Transaction::ONLINE_CHANNELS,
        ]);
    }
}