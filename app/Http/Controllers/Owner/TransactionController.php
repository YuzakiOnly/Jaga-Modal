<?php

namespace App\Http\Controllers\Owner;

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
            'payment_method' => ['required', 'in:cash,qris'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'change_amount' => ['required', 'numeric', 'min:0'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
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
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.is_custom' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $storeId) {
            $transactedAt = !empty($validated['transacted_at'])
                ? Carbon::parse($validated['transacted_at'])
                : now();

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
                'amount_paid' => $validated['amount_paid'],
                'change_amount' => $validated['change_amount'],
                'subtotal' => $validated['subtotal'],
                'discount' => $validated['discount'] ?? 0,
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
                    $product = Product::where('id', $item['product_id'])
                        ->where('store_id', $storeId)
                        ->first();

                    if ($product && $product->stock_type === 'limited') {
                        $product->decrement('stock', $item['qty']);
                    }
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
            'total_count' => (int) (clone $summaryQuery)->count(),
            'cash_count' => (int) (clone $summaryQuery)->where('payment_method', 'cash')->count(),
            'qris_count' => (int) (clone $summaryQuery)->where('payment_method', 'qris')->count(),
        ];

        $transactions = (clone $summaryQuery)
            ->with(['items', 'items.product:id,image', 'customer:id,customer_number,name,phone'])
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

        $customerBaseQuery = Transaction::forStore($storeId)
            ->completed()
            ->whereNotNull('customer_id');

        $customerBaseQuery = match ($period) {
            'weekly' => $customerBaseQuery->whereBetween('transacted_at', [
                now()->parse($date)->startOfWeek(),
                now()->parse($date)->endOfWeek(),
            ]),
            'monthly' => $customerBaseQuery
                ->whereMonth('transacted_at', now()->parse($date)->month)
                ->whereYear('transacted_at', now()->parse($date)->year),
            default => $customerBaseQuery->whereDate('transacted_at', $date),
        };

        $customers = $customerBaseQuery
            ->select(
                'customer_id',
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total) as total_spent'),
                DB::raw('MAX(transacted_at) as last_visit'),
            )
            ->groupBy('customer_id')
            ->orderByDesc('total_spent')
            ->with('customer:id,customer_number,name,phone')
            ->get()
            ->map(fn($row) => [
                'id' => $row->customer->id,
                'customer_number' => $row->customer->customer_number,
                'display_name' => $row->customer->display_name,
                'name' => $row->customer->name,
                'phone' => $row->customer->phone,
                'total_transactions' => (int) $row->total_transactions,
                'total_spent' => (float) $row->total_spent,
                'last_visit' => $row->last_visit,
            ]);

        return Inertia::render('owner/pos/history/page', [
            'transactions' => $transactions,
            'summary' => $summary,
            'customers' => $customers,
            'filters' => $request->only(['period', 'date']),
        ]);
    }
}