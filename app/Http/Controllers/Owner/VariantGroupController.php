<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\VariantGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VariantGroupController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $query = VariantGroup::where('store_id', $storeId);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $variantGroups = $query->withCount(['options', 'products'])
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('owner/variant-group/page', [
            'variantGroups' => $variantGroups,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $storeId = auth()->user()->store_id;

        $products = \App\Models\Product::where('store_id', $storeId)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/variant-group/create/page', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $validated = $this->validateVariantGroup($request);

        DB::transaction(function () use ($validated, $storeId) {
            $variantGroup = VariantGroup::create([
                'store_id' => $storeId,
                'name' => $validated['name'],
                'internal_note' => $validated['internal_note'] ?? null,
                'min_select' => (int) $validated['min_select'],
                'max_select' => (int) $validated['max_select'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            foreach ($validated['options'] as $index => $option) {
                $variantGroup->options()->create([
                    'name' => $option['name'],
                    'price_modifier' => (float) ($option['price_modifier'] ?? 0),
                    'sort_order' => $index,
                    'is_active' => $option['is_active'] ?? true,
                ]);
            }

            if (!empty($validated['product_ids'])) {
                $syncData = [];
                foreach ($validated['product_ids'] as $i => $productId) {
                    $syncData[$productId] = ['sort_order' => $i];
                }
                $variantGroup->products()->sync($syncData);
            }
        });

        return redirect()->route('owner.variant-groups')
            ->with('success', "Variant group \"{$validated['name']}\" created successfully.");
    }

    public function edit($storeSlug, VariantGroup $variantGroup)
    {
        if ($variantGroup->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $storeId = auth()->user()->store_id;

        $products = \App\Models\Product::where('store_id', $storeId)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/variant-group/edit/page', [
            'variantGroup' => $variantGroup->load(['options', 'products:id,name']),
            'products' => $products,
        ]);
    }

    public function update(Request $request, $storeSlug, VariantGroup $variantGroup)
    {
        $storeId = auth()->user()->store_id;

        if ($variantGroup->store_id !== $storeId) {
            abort(403);
        }

        $validated = $this->validateVariantGroup($request);

        DB::transaction(function () use ($validated, $variantGroup) {
            $variantGroup->update([
                'name' => $validated['name'],
                'internal_note' => $validated['internal_note'] ?? null,
                'min_select' => (int) $validated['min_select'],
                'max_select' => (int) $validated['max_select'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $existingOptionIds = [];

            foreach ($validated['options'] as $index => $option) {
                if (!empty($option['id'])) {
                    $variantGroup->options()
                        ->where('id', $option['id'])
                        ->update([
                            'name' => $option['name'],
                            'price_modifier' => (float) ($option['price_modifier'] ?? 0),
                            'sort_order' => $index,
                            'is_active' => $option['is_active'] ?? true,
                        ]);
                    $existingOptionIds[] = $option['id'];
                } else {
                    $newOption = $variantGroup->options()->create([
                        'name' => $option['name'],
                        'price_modifier' => (float) ($option['price_modifier'] ?? 0),
                        'sort_order' => $index,
                        'is_active' => $option['is_active'] ?? true,
                    ]);
                    $existingOptionIds[] = $newOption->id;
                }
            }

            $variantGroup->options()
                ->whereNotIn('id', $existingOptionIds)
                ->delete();

            $syncData = [];
            foreach (($validated['product_ids'] ?? []) as $i => $productId) {
                $syncData[$productId] = ['sort_order' => $i];
            }
            $variantGroup->products()->sync($syncData);
        });

        return redirect()->route('owner.variant-groups')
            ->with('success', "Variant group \"{$variantGroup->name}\" updated successfully.");
    }

    public function toggleActive($storeSlug, VariantGroup $variantGroup)
    {
        if ($variantGroup->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $variantGroup->update(['is_active' => !$variantGroup->is_active]);
        $state = $variantGroup->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Variant group \"{$variantGroup->name}\" {$state}.");
    }

    public function destroy($storeSlug, VariantGroup $variantGroup)
    {
        if ($variantGroup->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $name = $variantGroup->name;

        DB::transaction(function () use ($variantGroup) {
            $variantGroup->products()->detach();
            $variantGroup->options()->delete();
            $variantGroup->delete();
        });

        return redirect()->route('owner.variant-groups')
            ->with('success', "Variant group \"{$name}\" deleted.");
    }

    private function validateVariantGroup(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'internal_note' => ['nullable', 'string', 'max:500'],
            'min_select' => ['required', 'integer', 'min:0'],
            'max_select' => ['required', 'integer', 'min:1', 'gte:min_select'],
            'is_active' => ['boolean'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.id' => ['nullable', 'integer'],
            'options.*.name' => ['required', 'string', 'max:150'],
            'options.*.price_modifier' => ['nullable', 'numeric'],
            'options.*.is_active' => ['boolean'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);
    }
}