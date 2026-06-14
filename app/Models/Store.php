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
        // Semua pendapatan dari semua channel
        $totalIncome = Transaction::forStore($storeId)
            ->completed()
            ->sum('net_revenue');

        // Pengeluaran dari cash
        $cashExpenses = Expense::forStore($storeId)
            ->where('payment_source', 'cash')
            ->whereNotIn('type', ['store_transfer_in', 'owner_withdrawal'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Pengeluaran dari dine_in
        $dineInExpenses = Expense::forStore($storeId)
            ->where('payment_source', 'dine_in')
            ->whereNotIn('type', ['store_transfer_in', 'owner_withdrawal'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Penarikan owner dari cash atau dine_in
        $withdrawals = Expense::forStore($storeId)
            ->where('type', 'owner_withdrawal')
            ->whereIn('payment_source', ['cash', 'dine_in'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Transfer dari owner ke toko (cash atau dine_in)
        $transfersIn = Expense::forStore($storeId)
            ->where('type', 'store_transfer_in')
            ->whereIn('payment_source', ['cash', 'dine_in'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $result = $totalIncome - $cashExpenses - $dineInExpenses - $withdrawals + $transfersIn;

        return max(0, (float) $result);
    }

    public static function getDineInBalance(int $storeId): float
    {
        // Pendapatan dari transaksi dine_in
        $income = Transaction::forStore($storeId)
            ->completed()
            ->where('order_channel', 'dine_in')
            ->sum('net_revenue');

        // Pengeluaran dari sumber dine_in
        $expenses = Expense::forStore($storeId)
            ->where('payment_source', 'dine_in')
            ->whereNotIn('type', ['store_transfer_in', 'owner_withdrawal'])
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Penarikan owner dari dine_in
        $withdrawals = Expense::forStore($storeId)
            ->where('type', 'owner_withdrawal')
            ->where('payment_source', 'dine_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        // Transfer dari owner ke toko (masuk ke dine_in)
        $transfersIn = Expense::forStore($storeId)
            ->where('type', 'store_transfer_in')
            ->where('payment_source', 'dine_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $result = $income - $expenses - $withdrawals + $transfersIn;

        return max(0, (float) $result);
    }
}