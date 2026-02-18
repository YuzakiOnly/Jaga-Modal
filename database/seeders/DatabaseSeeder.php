<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('jagamodal@_2026_@'),
            'country_code' => '+62',
            'phone' => '085231823088',
            'locale' => 'id',
            'role' => 'super_admin',
        ]);

        User::create([
            'name' => 'Owner Demo',
            'username' => 'owner',
            'email' => 'owner@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('owner1234'),
            'country_code' => '+62',
            'phone' => '081234567890',
            'locale' => 'id',
            'role' => 'owner',
        ]);

        User::create([
            'name' => 'Admin Demo',
            'username' => 'admin',
            'email' => 'admin@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin1234'),
            'country_code' => '+62',
            'phone' => '081234567891',
            'locale' => 'id',
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Cashier Demo',
            'username' => 'cashier',
            'email' => 'cashier@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('cashier1234'),
            'country_code' => '+62',
            'phone' => '081234567892',
            'locale' => 'id',
            'role' => 'cashier',
        ]);

        User::create([
            'name' => 'Staff Demo',
            'username' => 'staff',
            'email' => 'staff@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('staff1234'),
            'country_code' => '+62',
            'phone' => '081234567893',
            'locale' => 'id',
            'role' => 'staff',
        ]);
    }

}