<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\CapitalPriceTemplate;
use App\Models\CapitalPriceTemplateIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CapitalPriceTemplateController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $query = CapitalPriceTemplate::where('store_id', $storeId);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $templates = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('owner/capital-price/page', [
            'templates' => $templates,
            'filters' => $request->only(['search']),
        ]);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function create()
    {
        return Inertia::render('owner/capital-price/create/page');
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $validated = $this->validateTemplate($request, $storeId);
        $ingredients = $this->validateIngredients($request);

        DB::transaction(function () use ($validated, $ingredients, $storeId) {
            $validated['store_id'] = $storeId;
            $validated['amount'] = 0; // akan di-recalculate setelah ingredients disimpan

            $template = CapitalPriceTemplate::create($validated);

            $this->syncIngredients($template, $ingredients);

            $template->recalculateAmount();
        });

        return redirect()->route('owner.capital-prices')
            ->with('success', "Template HPP \"{$validated['name']}\" berhasil dibuat.");
    }

    // ── Edit ──────────────────────────────────────────────────────────────────

    public function edit(CapitalPriceTemplate $capitalPrice)
    {
        if ($capitalPrice->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        return Inertia::render('owner/capital-price/edit/page', [
            'template' => $capitalPrice->load('ingredients'),
        ]);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, CapitalPriceTemplate $capitalPrice)
    {
        $storeId = auth()->user()->store_id;

        if ($capitalPrice->store_id !== $storeId) {
            abort(403);
        }

        $validated = $this->validateTemplate($request, $storeId, $capitalPrice->id);
        $ingredients = $this->validateIngredients($request);

        DB::transaction(function () use ($capitalPrice, $validated, $ingredients) {
            $capitalPrice->update($validated);

            $this->syncIngredients($capitalPrice, $ingredients);

            $capitalPrice->recalculateAmount();
        });

        return redirect()->route('owner.capital-prices')
            ->with('success', "Template HPP \"{$capitalPrice->name}\" berhasil diperbarui.");
    }

    // ── Toggle Active ─────────────────────────────────────────────────────────

    public function toggleActive(CapitalPriceTemplate $capitalPrice)
    {
        if ($capitalPrice->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $capitalPrice->update(['is_active' => !$capitalPrice->is_active]);
        $state = $capitalPrice->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Template \"{$capitalPrice->name}\" {$state}.");
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(CapitalPriceTemplate $capitalPrice)
    {
        if ($capitalPrice->store_id !== auth()->user()->store_id) {
            abort(403);
        }

        $name = $capitalPrice->name;
        $capitalPrice->delete(); // ingredients ikut terhapus via cascadeOnDelete

        return redirect()->route('owner.capital-prices')
            ->with('success', "Template HPP \"{$name}\" dihapus.");
    }

    // ── API — untuk dropdown di ProductForm ───────────────────────────────────

    public function options()
    {
        $storeId = auth()->user()->store_id;

        $templates = CapitalPriceTemplate::where('store_id', $storeId)
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'amount', 'description']);

        return response()->json($templates);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function syncIngredients(CapitalPriceTemplate $template, array $ingredients): void
    {
        // Hapus semua lama, ganti dengan yang baru
        $template->ingredients()->delete();

        foreach ($ingredients as $index => $ingredient) {
            $qty = (float) $ingredient['qty'];
            $price = (float) $ingredient['price'];
            $subtotal = round($qty * $price, 2);

            CapitalPriceTemplateIngredient::create([
                'capital_price_template_id' => $template->id,
                'name' => $ingredient['name'],
                'unit' => $ingredient['unit'],
                'qty' => $qty,
                'price' => $price,
                'subtotal' => $subtotal,
                'sort_order' => $index,
            ]);
        }
    }

    // ── Shared validation ─────────────────────────────────────────────────────

    private function validateTemplate(Request $request, int $storeId, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('capital_price_templates', 'name')
                    ->where('store_id', $storeId)
                    ->ignore($ignoreId),
            ],
            'product_name' => ['nullable', 'string', 'max:150'],
            'labor_cost' => ['nullable', 'numeric', 'min:0'],
            'overhead_cost' => ['nullable', 'numeric', 'min:0'],
            'output_qty' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);
    }

    private function validateIngredients(Request $request): array
    {
        $request->validate([
            'ingredients' => ['present', 'array'],
            'ingredients.*.name' => ['required', 'string', 'max:150'],
            'ingredients.*.unit' => ['required', 'string', 'max:30'],
            'ingredients.*.qty' => ['required', 'numeric', 'min:0.001'],
            'ingredients.*.price' => ['required', 'numeric', 'min:0'],
        ]);

        return $request->input('ingredients', []);
    }
}