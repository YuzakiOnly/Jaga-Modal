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
    ];

    protected $casts = [
        'is_custom' => 'boolean',
        'unit_price' => 'decimal:2',
        'capital_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'qty' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}