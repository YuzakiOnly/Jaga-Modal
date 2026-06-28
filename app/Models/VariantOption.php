<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VariantOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'variant_group_id',
        'name',
        'price_modifier',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function variantGroup()
    {
        return $this->belongsTo(VariantGroup::class);
    }
}