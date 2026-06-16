<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'business_type',
        'country',
        'province',
        'address',
        'latitude',
        'longitude',
        'logo',
        'thumbnail',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCashBalanceAttribute(): float
    {
        return static::computeCashBalance($this->id);
    }

    public static function computeCashBalance(int $storeId): float
    {
        // Semua pendapatan dari transaksi
        $totalIncome = Transaction::forStore($storeId)
            ->completed()
            ->sum('total');

        // Semua pengeluaran (tanpa filter payment_source)
        $expenses = Expense::forStore($storeId)
            ->whereNotIn('type', ['store_transfer_in', 'owner_withdrawal'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Penarikan owner
        $withdrawals = Expense::forStore($storeId)
            ->where('type', 'owner_withdrawal')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Transfer dari owner ke toko
        $transfersIn = Expense::forStore($storeId)
            ->where('type', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $result = $totalIncome - $expenses - $withdrawals + $transfersIn;

        return max(0, (float) $result);
    }
}