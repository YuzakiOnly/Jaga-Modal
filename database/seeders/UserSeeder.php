<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Primary Super Admin (seeded from .env) ──
        $superAdmin = User::updateOrCreate(
            ['email' => env('SUPER_ADMIN_EMAIL', 'admin@jagamodal.com')],
            [
                'name' => 'Super Admin',
                'username' => 'super_admin',
                'phone_verified_at' => now(),
                'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'jagamodal@_2026_@')),
                'country_code' => '+62',
                'phone' => env('SUPER_PHONE', '08512345678'),
                'locale' => 'id',
                'role' => 'super_admin',
                'is_primary' => true,
            ]
        );

        // Create store for Super Admin if doesn't exist
        if (!$superAdmin->store_id) {
            $store = Store::create([
                'user_id' => $superAdmin->id,
                'name' => 'Super Admin Store',
                'business_type' => 'retail',
                'country' => 'ID',
                'province' => 'DKI Jakarta',
                'address' => 'Jl. Admin No. 1, Jakarta Pusat',
                'is_active' => 'active',
            ]);
            $superAdmin->store_id = $store->id;
            $superAdmin->save();
            $this->command->info("✅ Store created for Super Admin: {$store->name}");
        }

        // ── Owner 1 (Primary Owner from .env) ──
        $owner1 = User::updateOrCreate(
            ['email' => env('OWNER_EMAIL', 'owner@jagamodal.com')],
            [
                'name' => 'Owner 1',
                'username' => 'owner1',
                'phone_verified_at' => now(),
                'password' => Hash::make(env('OWNER_PASSWORD', 'jagamodal2026')),
                'country_code' => '+62',
                'phone' => env('OWNER_PHONE', '085607322468'),
                'locale' => 'id',
                'role' => 'owner',
                'is_primary' => true,
            ]
        );

        // Create store for Owner 1 if doesn't exist
        if (!$owner1->store_id) {
            $store1 = Store::create([
                'user_id' => $owner1->id,
                'name' => 'Toko Owner 1 - JagaModal',
                'business_type' => 'retail',
                'country' => 'ID',
                'province' => 'Jawa Barat',
                'address' => 'Jl. Merdeka No. 123, Bandung',
                'is_active' => 'active',
            ]);
            $owner1->store_id = $store1->id;
            $owner1->save();
            $this->command->info("✅ Store created for Owner 1: {$store1->name}");
        }

        // ── Owner 2 (Additional Owner) ──
        $owner2 = User::updateOrCreate(
            ['email' => 'owner2@jagamodal.com'],
            [
                'name' => 'Owner 2',
                'username' => 'owner2',
                'phone_verified_at' => now(),
                'password' => Hash::make('jagamodal2026'),
                'country_code' => '+62',
                'phone' => '085607322469',
                'locale' => 'id',
                'role' => 'owner',
                'is_primary' => false,
            ]
        );

        // Create store for Owner 2 if doesn't exist
        if (!$owner2->store_id) {
            $store2 = Store::create([
                'user_id' => $owner2->id,
                'name' => 'Toko Owner 2 - JagaModal',
                'business_type' => 'grocery',
                'country' => 'ID',
                'province' => 'Jawa Timur',
                'address' => 'Jl. Sudirman No. 45, Surabaya',
                'is_active' => 'active',
            ]);
            $owner2->store_id = $store2->id;
            $owner2->save();
            $this->command->info("✅ Store created for Owner 2: {$store2->name}");
        }

        // ── Cashier (from .env) ──
        User::updateOrCreate(
            ['email' => env('CASHIER_EMAIL', 'cashier@jagamodal.com')],
            [
                'name' => 'Cashier',
                'username' => 'cashier',
                'phone_verified_at' => now(),
                'password' => Hash::make(env('CASHIER_PASSWORD', 'cashiermodal2026')),
                'country_code' => '+62',
                'phone' => env('CASHIER_PHONE', '081245673245'),
                'locale' => 'id',
                'role' => 'cashier',
                'is_primary' => false,
                'store_id' => null, // Cashier tidak punya store sendiri
            ]
        );

        $this->command->info('');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅ SEEDER COMPLETED SUCCESSFULLY!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('📋 ACCOUNT LOGIN:');
        $this->command->info('');
        $this->command->info('🔹 SUPER ADMIN:');
        $this->command->info('   Email: ' . env('SUPER_ADMIN_EMAIL', 'admin@jagamodal.com'));
        $this->command->info('   Password: ' . env('SUPER_ADMIN_PASSWORD', 'jagamodal@_2026_@'));
        $this->command->info('');
        $this->command->info('🔹 OWNER 1:');
        $this->command->info('   Email: ' . env('OWNER_EMAIL', 'owner@jagamodal.com'));
        $this->command->info('   Password: ' . env('OWNER_PASSWORD', 'jagamodal2026'));
        $this->command->info('');
        $this->command->info('🔹 OWNER 2:');
        $this->command->info('   Email: owner2@jagamodal.com');
        $this->command->info('   Password: jagamodal2026');
        $this->command->info('');
        $this->command->info('🔹 CASHIER:');
        $this->command->info('   Email: ' . env('CASHIER_EMAIL', 'cashier@jagamodal.com'));
        $this->command->info('   Password: ' . env('CASHIER_PASSWORD', 'cashiermodal2026'));
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}