<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Category;
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:200'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.capital_price' => ['required', 'numeric', 'min:0'], // capital_price wajib untuk semua item (custom bisa 0)
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.is_custom' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $storeId) {
            $transactedAt = !empty($validated['transacted_at'])
                ? Carbon::parse($validated['transacted_at'])
                : now();

            $transaction = Transaction::create([
                'store_id' => $storeId,
                'user_id' => auth()->id(),
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
                    'capital_price' => $item['capital_price'], // Nilai capital_price dari item custom akan tersimpan
                    'qty' => $item['qty'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $item['subtotal'],
                ]);

                // Kurangi stok hanya untuk produk non-custom yang stoknya terbatas
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