<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CapitalPriceTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'product_name',
        'labor_cost',
        'overhead_cost',
        'output_qty',
        'amount',
        'description',
        'is_active',
    ];

    protected $casts = [
        'labor_cost' => 'decimal:2',
        'overhead_cost' => 'decimal:2',
        'output_qty' => 'integer',
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function ($template) {
            if (auth()->check() && !$template->store_id) {
                $template->store_id = auth()->user()->store_id;
            }

            if (!$template->store_id) {
                throw new \RuntimeException('Store ID is required.');
            }
        });
    }

    /**
     * Hitung ulang amount (HPP per unit) berdasarkan ingredients + biaya operasional.
     * Dipanggil setelah ingredients disimpan/diupdate.
     */
    public function recalculateAmount(): void
    {
        $totalIngredients = $this->ingredients()->sum('subtotal');
        $totalCost = $totalIngredients + $this->labor_cost + $this->overhead_cost;
        $qty = max(1, (int) $this->output_qty);

        $this->updateQuietly(['amount' => round($totalCost / $qty, 2)]);
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function ingredients()
    {
        return $this->hasMany(CapitalPriceTemplateIngredient::class, 'capital_price_template_id')
            ->orderBy('sort_order');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}