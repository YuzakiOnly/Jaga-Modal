<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VariantGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'store_id',
        'name',
        'internal_note',
        'min_select',
        'max_select',
        'is_active',
    ];

    protected $casts = [
        'min_select' => 'integer',
        'max_select' => 'integer',
        'is_active' => 'boolean',
    ];

    public function getIsRequiredAttribute(): bool
    {
        return $this->min_select > 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function options()
    {
        return $this->hasMany(VariantOption::class)->orderBy('sort_order');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_variant_group')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}