<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $query = Product::with('category')->where('store_id', $storeId);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status === 'active')
                $query->where('is_active', true);
            if ($status === 'inactive')
                $query->where('is_active', false);
            if ($status === 'low_stock')
                $query->lowStock();
        }

        // Stock type filter
        if ($stockType = $request->input('stock_type')) {
            $query->where('stock_type', $stockType);
        }

        // Sorting
        $sortField = $request->input('sort', 'created_at');
        $sortDir = $request->input('direction', 'desc');
        $allowed = ['name', 'selling_price', 'stock', 'created_at', 'is_active'];

        if (in_array($sortField, $allowed)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $products = $query->paginate(15)->withQueryString();
        $categories = Category::where('store_id', $storeId)->active()->ordered()->get(['id', 'name']);

        return Inertia::render('owner/product/page', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status', 'stock_type', 'sort', 'direction']),
        ]);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function create()
    {
        $storeId = auth()->user()->store_id;

        $categories = Category::where('store_id', $storeId)->active()->ordered()->get(['id', 'name']);

        return Inertia::render('owner/product/create/page', [
            'categories' => $categories,
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $validated = $this->validateProduct($request, $storeId);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $validated['store_id'] = $storeId;

        Product::create($validated);

        return redirect()->route('owner.products')
            ->with('success', "Product \"{$validated['name']}\" created successfully.");
    }

    // ── Edit ──────────────────────────────────────────────────────────────────

    public function edit(Product $product)
    {
        if ($product->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $storeId = auth()->user()->store_id;
        $categories = Category::where('store_id', $storeId)->active()->ordered()->get(['id', 'name']);

        return Inertia::render('owner/product/edit/page', [
            'product' => $product->load('category'),
            'categories' => $categories,
        ]);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, Product $product)
    {
        $storeId = auth()->user()->store_id;

        if ($product->store_id !== $storeId) {
            abort(403);
        }

        $validated = $this->validateProduct($request, $storeId, $product->id);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('owner.products')
            ->with('success', "Product \"{$product->name}\" updated successfully.");
    }

    // ── Toggle Active ─────────────────────────────────────────────────────────

    public function toggleActive(Product $product)
    {
        if ($product->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $product->update(['is_active' => !$product->is_active]);
        $state = $product->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Product \"{$product->name}\" {$state}.");
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(Product $product)
    {
        // Cek ownership dulu sebelum apapun
        if ($product->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $name = $product->name;

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('owner.products')
            ->with('success', "Product \"{$name}\" deleted.");
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

        // Ambil semua produk yang diminta, pastikan milik toko ini
        $products = Product::where('store_id', $storeId)
            ->where('stock_type', 'limited')
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        $updated = 0;

        foreach ($request->items as $item) {
            $product = $products->get($item['id']);

            if (!$product)
                continue; // skip produk yang bukan milik toko

            $product->increment('stock', (int) $item['qty']);
            $updated++;
        }

        return back()->with(
            'success',
            "Stok berhasil diperbarui untuk {$updated} produk."
        );
    }

    // ── Shared validation ─────────────────────────────────────────────────────

    private function validateProduct(Request $request, int $storeId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('store_id', $storeId),
            ],
            'name' => ['required', 'string', 'max:150'],
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'sku')
                    ->where('store_id', $storeId)
                    ->ignore($ignoreId)
                    ->whereNull('deleted_at'),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('products', 'barcode')
                    ->where('store_id', $storeId)
                    ->ignore($ignoreId)
                    ->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'capital_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock_type' => ['required', 'in:limited,unlimited'],
            'stock' => ['nullable', 'integer', 'min:0', 'required_if:stock_type,limited'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);
    }
}