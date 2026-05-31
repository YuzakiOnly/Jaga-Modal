<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapitalPriceTemplateIngredient extends Model
{
    protected $fillable = [
        'capital_price_template_id',
        'name',
        'unit',
        'price',
        'qty',
        'subtotal',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'qty' => 'decimal:3',
        'subtotal' => 'decimal:2',
    ];

    public function template()
    {
        return $this->belongsTo(CapitalPriceTemplate::class, 'capital_price_template_id');
    }
}