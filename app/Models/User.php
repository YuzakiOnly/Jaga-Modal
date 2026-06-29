<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    public const MAX_EMPLOYEES_PER_STORE = 5;

    protected $fillable = [
        'name',
        'username',
        'email',
        'country_code',
        'phone',
        'avatar',
        'thumbnail',
        'password',
        'locale',
        'role',
        'is_primary',
        'phone_verified_at',
        'store_id',
        'invited_by',
        'approval_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_primary' => 'boolean',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    public function isPrimary(): bool
    {
        return (bool) $this->is_primary;
    }

    public function isPendingApproval(): bool
    {
        return $this->approval_status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function invitedUsers()
    {
        return $this->hasMany(User::class, 'invited_by');
    }

    public static function activeEmployeeCount(int $storeId): int
    {
        return static::where('store_id', $storeId)
            ->where('role', '!=', 'owner')
            ->count();
    }

    public static function hasReachedEmployeeLimit(int $storeId): bool
    {
        return static::activeEmployeeCount($storeId) >= static::MAX_EMPLOYEES_PER_STORE;
    }
}