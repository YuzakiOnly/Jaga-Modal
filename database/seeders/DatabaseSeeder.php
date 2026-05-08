<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@jagamodal.com',
            'phone_verified_at' => now(),
            'password' => Hash::make('jagamodal@_2026_@'),
            'country_code' => '+62',
            'phone' => '085231823088',
            'locale' => 'id',
            'role' => 'admin',
        ]);

        $owner = User::create([
            'name' => 'Owner Demo',
            'username' => 'owner',
            'email' => 'owner@jagamodal.com',
            'phone_verified_at' => now(),
            'password' => Hash::make('owner1234'),
            'country_code' => '+62',
            'phone' => '081234567890',
            'locale' => 'id',
            'role' => 'owner',
        ]);

        Store::create([
            'user_id' => $owner->id,
            'name' => 'Toko Demo',
            'business_type' => 'retail',
            'country' => 'ID',
            'province' => 'Jawa Timur',
            'address' => 'Jl. Demo No. 1, Banyuwangi',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Cashier Demo',
            'username' => 'cashier',
            'email' => 'cashier@jagamodal.com',
            'phone_verified_at' => now(),
            'password' => Hash::make('cashier1234'),
            'country_code' => '+62',
            'phone' => '081234567892',
            'locale' => 'id',
            'role' => 'cashier',
        ]);
    }
}