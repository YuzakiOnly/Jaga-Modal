<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'expenses';

    protected $fillable = [
        'store_id',
        'user_id',
        'type',
        'payment_source',
        'description',
        'amount',
        'quantity',
        'unit_price',
        'employee_name',
        'salary_period',
        'expensed_at',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'expensed_at' => 'date',
        'metadata' => 'array',
    ];

    public function getTotalAmountAttribute(): float
    {
        if ($this->type === 'raw_material' && $this->quantity && $this->unit_price) {
            return (float) ($this->quantity * $this->unit_price);
        }
        return (float) ($this->amount ?? 0);
    }

    public function getPaymentSourceLabelAttribute(): string
    {
        return $this->payment_source === 'online' ? 'Saldo Online' : 'Kas Toko';
    }

    protected static function booted(): void
    {
        static::created(function (Expense $expense) {
            if ($expense->payment_source === 'online') {
                OnlineBalance::deductBalance($expense->store_id, $expense->total_amount);
            }
        });

        static::deleted(function (Expense $expense) {
            if ($expense->payment_source === 'online') {
                // Refund balance when expense is deleted
                $currentBalance = OnlineBalance::getBalance($expense->store_id);
                OnlineBalance::addRevenue(
                    $expense->store_id,
                    'refund',
                    $expense->total_amount
                );
            }
        });
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function walletTransaction()
    {
        return $this->hasOne(OwnerWalletTransaction::class, 'expense_id');
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function scopeForPaymentSource($query, $source)
    {
        return $query->where('payment_source', $source);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}