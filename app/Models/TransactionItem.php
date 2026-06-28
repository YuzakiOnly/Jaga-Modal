<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'name',
        'is_custom',
        'unit_price',
        'capital_price',
        'qty',
        'discount',
        'subtotal',
        'variant_details',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'capital_price' => 'decimal:2',
        'qty' => 'integer',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'is_custom' => 'boolean',
        'variant_details' => 'array',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}