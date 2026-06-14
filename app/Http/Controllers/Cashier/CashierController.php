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
                'price_gobiz',
                'price_grabfood',
                'price_shopeefood',
                'enable_online_food',
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

    private function getPlatformFeeRate(string $channel): float
    {
        return match ($channel) {
            'grabfood' => 0.20,
            'gobiz' => 0.20,
            'shopeefood' => 0.25,
            default => 0.0,
        };
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
            'platform_items_total' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:200'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.base_unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.capital_price' => ['required', 'numeric', 'min:0'],
            'items.*.original_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.is_custom' => ['required', 'boolean'],
            'items.*.is_using_platform_price' => ['nullable', 'boolean'],
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

        $transaction = null;

        DB::transaction(function () use ($validated, $storeId, &$transaction) {
            $transactedAt = !empty($validated['transacted_at'])
                ? Carbon::parse($validated['transacted_at'])
                : now();

            $isOnline = in_array($validated['order_channel'], Transaction::ONLINE_CHANNELS);

            // Gunakan platform fee dari request atau hitung ulang
            $platformFee = $validated['platform_fee'] ?? 0;

            if ($isOnline && $platformFee == 0) {
                $feeRate = $this->getPlatformFeeRate($validated['order_channel']);

                // Hitung total dari item yang menggunakan platform price
                $platformItemsTotal = 0;
                foreach ($validated['items'] as $item) {
                    $isUsingPlatformPrice = $item['is_using_platform_price'] ?? false;
                    if ($isUsingPlatformPrice) {
                        $platformItemsTotal += $item['unit_price'] * $item['qty'];
                    }
                }

                $platformFee = (int) round($platformItemsTotal * $feeRate);
            }

            $netRevenue = $validated['total'] - $platformFee;

            // Handle customer
            $customer = null;
            $customerName = $validated['customer_name'] ?? null;
            $customerPhone = $validated['customer_phone'] ?? null;

            if ($customerName || $customerPhone) {
                // Cari customer berdasarkan nomor telepon atau nama
                if ($customerPhone) {
                    $customer = Customer::where('store_id', $storeId)
                        ->where('phone', $customerPhone)
                        ->first();
                }

                if (!$customer && $customerName) {
                    $customer = Customer::where('store_id', $storeId)
                        ->where('name', $customerName)
                        ->first();
                }

                if (!$customer) {
                    // Buat customer baru
                    $lastCustomer = Customer::where('store_id', $storeId)
                        ->orderBy('customer_number', 'desc')
                        ->first();

                    $nextNumber = $lastCustomer ? intval($lastCustomer->customer_number) + 1 : 1;
                    $customerNumber = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

                    $customer = Customer::create([
                        'store_id' => $storeId,
                        'customer_number' => $customerNumber,
                        'name' => $customerName,
                        'phone' => $customerPhone,
                        'total_transactions' => 0,
                        'total_spent' => 0,
                    ]);
                }
            }

            $transaction = Transaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
                'customer_id' => $customer ? $customer->id : null,
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

            // Update customer stats jika ada customer
            if ($customer) {
                $customer->increment('total_transactions');
                $customer->increment('total_spent', $validated['total']);
            }

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

                // Kurangi stok hanya untuk produk non-custom dengan stock type limited
                if (!$item['is_custom'] && $item['product_id']) {
                    $product = Product::where('id', $item['product_id'])
                        ->where('store_id', $storeId)
                        ->first();

                    if ($product && $product->stock_type === 'limited') {
                        $product->decrement('stock', $item['qty']);
                    }
                }
            }
        });

        // Return response dengan data transaksi untuk ditampilkan di success overlay
        return redirect()->route('cashier.pos')
            ->with('success', 'Transaksi berhasil disimpan.')
            ->with('transaction', [
                'transaction_number' => $transaction->transaction_number ?? null,
                'total' => $validated['total'],
                'subtotal' => $validated['subtotal'],
                'discount' => $validated['discount'] ?? 0,
                'amount_paid' => $validated['amount_paid'],
                'change' => $validated['change_amount'],
                'order_channel' => $validated['order_channel'],
                'payment_method' => $validated['payment_method'],
                'platform_fee' => $platformFee ?? 0,
                'net_revenue' => ($validated['total'] - ($platformFee ?? 0)),
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
            ]);
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
                    'customer_name' => $transaction->customer?->name,
                    'customer_phone' => $transaction->customer?->phone,
                    'customer_number' => $transaction->customer?->customer_number,
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

    public function receipt($id)
    {
        $storeId = auth()->user()->store_id;

        $transaction = Transaction::where('store_id', $storeId)
            ->with(['items', 'customer', 'user'])
            ->findOrFail($id);

        return Inertia::render('cashier/receipt/page', [
            'transaction' => [
                'id' => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'payment_method' => $transaction->payment_method,
                'order_channel' => $transaction->order_channel,
                'amount_paid' => $transaction->amount_paid,
                'change_amount' => $transaction->change_amount,
                'subtotal' => $transaction->subtotal,
                'discount' => $transaction->discount,
                'platform_fee' => $transaction->platform_fee,
                'net_revenue' => $transaction->net_revenue,
                'total' => $transaction->total,
                'notes' => $transaction->notes,
                'transacted_at' => $transaction->transacted_at,
                'customer_name' => $transaction->customer?->name,
                'customer_phone' => $transaction->customer?->phone,
                'customer_number' => $transaction->customer?->customer_number,
                'cashier_name' => $transaction->user?->name,
                'items' => $transaction->items->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'qty' => $item->qty,
                        'unit_price' => $item->unit_price,
                        'discount' => $item->discount,
                        'subtotal' => $item->subtotal,
                        'is_custom' => $item->is_custom,
                    ];
                }),
            ],
        ]);
    }
}