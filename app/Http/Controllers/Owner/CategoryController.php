<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $query = Category::where('store_id', $storeId);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $sortField = $request->input('sort', 'sort_order');
        $sortDir = $request->input('direction', 'asc');
        $allowed = ['name', 'sort_order', 'created_at', 'is_active'];

        if (in_array($sortField, $allowed)) {
            $query->orderBy($sortField, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $categories = $query->withCount('products')->paginate(15)->withQueryString();

        $baseQuery = Category::where('store_id', $storeId);

        return Inertia::render('owner/category/page', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
            'counts' => [
                'total' => (clone $baseQuery)->count(),
                'active' => (clone $baseQuery)->where('is_active', true)->count(),
                'inactive' => (clone $baseQuery)->where('is_active', false)->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('owner/category/create/page');
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name')->where(function ($query) use ($storeId) {
                    return $query->where('store_id', $storeId);
                }),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $validated['store_id'] = $storeId;

        Category::create($validated);

        return redirect()->route('owner.categories')
            ->with('success', "Category \"{$validated['name']}\" created successfully.");
    }

    public function edit($storeSlug, Category $category)
    {
        if ($category->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        return Inertia::render('owner/category/edit/page', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, $storeSlug, Category $category)
    {
        $storeId = auth()->user()->store_id;

        if ($category->store_id !== $storeId) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'name')
                    ->where('store_id', $storeId)
                    ->ignore($category->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $category->update($validated);

        return redirect()->route('owner.categories')
            ->with('success', "Category \"{$category->name}\" updated successfully.");
    }

    public function toggleActive($storeSlug, Category $category)
    {
        if ($category->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $category->update(['is_active' => !$category->is_active]);

        $state = $category->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Category \"{$category->name}\" {$state}.");
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:categories,id'],
            'items.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->input('items') as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['order']]);
        }

        return back()->with('success', 'Category order updated.');
    }

    public function destroy($storeSlug, Category $category)
    {
        if ($category->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        if ($category->products()->exists()) {
            return back()->with('error', 'Cannot delete category with existing products.');
        }

        $name = $category->name;

        $category->delete();

        return redirect()->route('owner.categories')
            ->with('success', "Category \"{$name}\" deleted.");
    }
}