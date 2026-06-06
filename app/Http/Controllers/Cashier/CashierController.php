<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $storeId = $user->store_id;

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
                'minimum_stock',
                'is_active',
                'image',
                'sku',
                'barcode',
                'unit',
            ]);

        $categories = Category::where('store_id', $storeId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('cashier/page', [
            'products' => $products,
            'categories' => $categories,
            'online_channels' => Transaction::ONLINE_CHANNELS,
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
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
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

            $platformFee = $validated['platform_fee'] ?? 0;
            $netRevenue = $validated['total'] - $platformFee;

            $customer = Customer::resolveForTransaction(
                $storeId,
                $validated['customer_name'] ?? null,
                $validated['customer_phone'] ?? null,
                $transactedAt
            );

            $transaction = Transaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'customer_id' => $customer->id,
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
                    'capital_price' => $item['capital_price'],
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

        return redirect()->route('cashier.pos')
            ->with('success', 'Transaksi berhasil disimpan.');
    }

    public function history(Request $request)
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
            'total_revenue' => (float) (clone $summaryQuery)->sum('total'),
            'total_net_revenue' => (float) (clone $summaryQuery)->sum('net_revenue'),
            'total_platform_fee' => (float) (clone $summaryQuery)->sum('platform_fee'),
            'total_count' => (int) (clone $summaryQuery)->count(),
            'cash_count' => (int) (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (int) (clone $summaryQuery)->where('payment_method', 'qris')->count(),
            'grabfood_count' => (int) (clone $summaryQuery)->where('order_channel', 'grabfood')->count(),
            'shopeefood_count' => (int) (clone $summaryQuery)->where('order_channel', 'shopeefood')->count(),
            'gobiz_count' => (int) (clone $summaryQuery)->where('order_channel', 'gobiz')->count(),
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
            'filters' => $request->only(['period', 'date']),
            'online_channels' => Transaction::ONLINE_CHANNELS,
        ]);
    }

    public function stockAdjust(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $ids = collect($request->items)->pluck('id');

        $products = Product::where('store_id', $storeId)
            ->where('stock_type', 'limited')
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        $updated = 0;

        foreach ($request->items as $item) {
            $product = $products->get($item['id']);
            if (!$product) {
                continue;
            }

            $product->increment('stock', (int) $item['qty']);
            $updated++;
        }

        return back()->with('success', "Stok berhasil diperbarui untuk {$updated} produk.");
    }
}