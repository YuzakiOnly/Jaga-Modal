<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InviteCode extends Model
{
    protected $fillable = ['code', 'is_used', 'used_at', 'used_by'];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
    ];

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function isAvailable(): bool
    {
        return !$this->is_used;
    }

    /**
     * Tandai kode sudah dipakai oleh user tertentu
     */
    public function markAsUsed(int $userId): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
            'used_by' => $userId,
        ]);
    }
}