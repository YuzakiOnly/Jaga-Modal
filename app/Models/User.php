<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }
    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }
}