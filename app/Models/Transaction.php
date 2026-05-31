<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'store_id',
        'user_id',
        'transaction_number',
        'payment_method',
        'amount_paid',
        'change_amount',
        'subtotal',
        'discount',
        'total',
        'status',
        'notes',
        'transacted_at',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'transacted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction) {
            if (empty($transaction->transaction_number)) {
                $transaction->transaction_number = static::generateNumber(
                    $transaction->store_id
                );
            }

            if (empty($transaction->transacted_at)) {
                $transaction->transacted_at = now();
            }
        });
    }

    protected static function generateNumber(int $storeId): string
    {
        $date = Carbon::now()->format('Ymd');
        $prefix = "TRX-{$date}-";

        $last = static::where('store_id', $storeId)
            ->where('transaction_number', 'like', "{$prefix}%")
            ->orderByDesc('transaction_number')
            ->value('transaction_number');

        $seq = $last
            ? (int) substr($last, strrpos($last, '-') + 1) + 1
            : 1;

        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('transacted_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('transacted_at', [
            now()->startOfWeek(),
            now()->endOfWeek(),
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('transacted_at', now()->month)
            ->whereYear('transacted_at', now()->year);
    }
}