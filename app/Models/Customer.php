<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'customer_number',
        'name',
        'phone',
        'created_at',
        'updated_at',
    ];

    public function getDisplayNameAttribute(): string
    {
        return $this->name
            ? $this->name
            : "Pelanggan #{$this->customer_number}";
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public static function resolveForTransaction(
        int $storeId,
        ?string $name,
        ?string $phone,
        $transactedAt = null
    ): self {
        $createdAt = $transactedAt ? Carbon::parse($transactedAt) : now();

        if ($phone) {
            $existing = self::where('store_id', $storeId)
                ->where('phone', $phone)
                ->first();

            if ($existing) {
                if ($name && !$existing->name) {
                    $existing->update(['name' => $name]);
                }
                return $existing;
            }
        }

        $nextNumber = (self::where('store_id', $storeId)->max('customer_number') ?? 0) + 1;

        return self::create([
            'store_id' => $storeId,
            'customer_number' => $nextNumber,
            'name' => $name ?: null,
            'phone' => $phone ?: null,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}