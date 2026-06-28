<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmployeeInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'store_id',
        'invited_by',
        'role',
        'name',
        'expires_at',
        'used_at',
        'used_by',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public static function generateToken(): string
    {
        do {
            $token = Str::lower(Str::random(32));
        } while (static::where('token', $token)->exists());

        return $token;
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }

    public function markAsUsed(int $userId): void
    {
        $this->update([
            'used_at' => now(),
            'used_by' => $userId,
        ]);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }
}
