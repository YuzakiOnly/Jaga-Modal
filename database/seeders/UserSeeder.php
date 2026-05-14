<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Primary Super Admin (seeded from .env, protected from all edits) ──
        User::updateOrCreate(
            ['email' => env('SUPER_ADMIN_EMAIL')],
            [
                'name' => 'Super Admin',
                'username' => env('SUPER_ADMIN_USERNAME', 'super_admin'),
                'phone_verified_at' => now(),
                'password' => Hash::make(env('SUPER_ADMIN_PASSWORD')),
                'country_code' => '+62',
                'phone' => env('SUPER_ADMIN_PHONE'),
                'locale' => 'id',
                'role' => 'super_admin',
                'is_primary' => true,
            ]
        );

        // ── Owner Demo ────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => env('OWNER_EMAIL')],
            [
                'name' => 'Owner Demo',
                'username' => 'owner',
                'phone_verified_at' => now(),
                'password' => Hash::make(env('OWNER_PASSWORD')),
                'country_code' => '+62',
                'phone' => env('OWNER_PHONE'),
                'locale' => 'id',
                'role' => 'owner',
                'is_primary' => false,
            ]
        );

        // ── Cashier Demo ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => env('CASHIER_EMAIL')],
            [
                'name' => 'Cashier Demo',
                'username' => 'cashier',
                'phone_verified_at' => now(),
                'password' => Hash::make(env('CASHIER_PASSWORD')),
                'country_code' => '+62',
                'phone' => env('CASHIER_PHONE'),
                'locale' => 'id',
                'role' => 'cashier',
                'is_primary' => false,
            ]
        );
    }
}