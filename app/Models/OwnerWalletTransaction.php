<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OwnerWalletTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'owner_wallet_transactions';

    protected $fillable = [
        'store_id',
        'user_id',
        'flow',          // in | out
        'source',        // withdrawal | manual_topup | personal_out
        'amount',
        'description',
        'notes',
        'expense_id',
        'transacted_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transacted_at' => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function expense()
    {
        return $this->belongsTo(Expense::class)->withTrashed();
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function scopeIn($query)
    {
        return $query->where('flow', 'in');
    }

    public function scopeOut($query)
    {
        return $query->where('flow', 'out');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Hitung saldo dompet untuk satu toko.
     */
    public static function balanceForStore(int $storeId): float
    {
        $in = static::where('store_id', $storeId)->where('flow', 'in')->sum('amount');
        $out = static::where('store_id', $storeId)->where('flow', 'out')->sum('amount');
        return (float) $in - (float) $out;
    }
}