<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'business_type',
        'phone',
        'logo',
        'thumbnail',
        'country',
        'province',
        'city',
        'address',
        'latitude',
        'longitude',
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

    public function getLogoUrlAttribute()
    {
        if (!$this->logo) {
            return null;
        }

        if (Storage::disk('private')->exists($this->logo)) {
            return route('private.files.stream', ['path' => $this->logo]);
        }

        return null;
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
        $totalIncome = DB::table('transactions')
            ->where('store_id', $storeId)
            ->where('status', 'completed')
            ->sum('total');

        $totalExpenses = DB::table('expenses')
            ->where('store_id', $storeId)
            ->whereIn('type', ['simple', 'raw_material', 'salary', 'owner_withdrawal'])
            ->sum('amount');

        $transfersIn = DB::table('expenses')
            ->where('store_id', $storeId)
            ->where('type', 'store_transfer_in')
            ->sum('amount');

        $result = (float) $totalIncome - (float) $totalExpenses + (float) $transfersIn;

        return max(0, $result);
    }
}