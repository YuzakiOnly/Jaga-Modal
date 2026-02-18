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
            'username' => 'admin',
            'email' => 'admin@jagamodal.com',
            'email_verified_at' => now(),
            'password' => Hash::make('jagamodal@_2026_@'),
            'country_code' => '+62',
            'phone' => '085231823088',
            'locale' => '',
            'role' => 'admin',
        ]);
    }

}
