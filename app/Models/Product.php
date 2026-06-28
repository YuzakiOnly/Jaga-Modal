<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'image',
        'capital_price',
        'selling_price',
        'stock_type',
        'stock',
        'minimum_stock',
        'unit',
        'is_active',
    ];

    protected $casts = [
        'capital_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (auth()->check() && !$product->store_id) {
                $product->store_id = auth()->user()->store_id;
            }

            if (!$product->store_id) {
                throw new \RuntimeException('Store ID is required to generate a unique slug.');
            }

            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name, $product->store_id);
            }
        });

        static::updating(function (Product $product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                if (!$product->store_id) {
                    throw new \RuntimeException('Store ID is required to generate a unique slug.');
                }
                $product->slug = static::generateUniqueSlug($product->name, $product->store_id, $product->id);
            }
        });
    }

    protected static function generateUniqueSlug(string $name, int $storeId, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $count = 1;
        $base = $slug;

        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->where('store_id', $storeId)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function getLowStockAttribute(): bool
    {
        return $this->stock_type === 'limited'
            && $this->minimum_stock !== null
            && $this->stock !== null
            && $this->stock <= $this->minimum_stock;
    }

    public function getProfitAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->capital_price;
    }

    public function getProfitMarginAttribute(): float
    {
        if ((float) $this->selling_price === 0.0)
            return 0;
        return round(($this->profit / (float) $this->selling_price) * 100, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->where('stock_type', 'limited')
            ->whereNotNull('minimum_stock')
            ->whereNotNull('stock')
            ->whereColumn('stock', '<=', 'minimum_stock');
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function variantGroups()
    {
        return $this->belongsToMany(VariantGroup::class, 'product_variant_group')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderBy('product_variant_group.sort_order');
    }
}