<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan semua owner yang belum punya store dibuatkan store-nya
        $owners = User::where('role', 'owner')->whereNull('store_id')->get();

        foreach ($owners as $owner) {
            $store = Store::create([
                'user_id' => $owner->id,
                'name' => $owner->name . "'s Store",
                'business_type' => 'retail',
                'country' => 'ID',
                'province' => 'DKI Jakarta',
                'address' => 'Jl. Contoh No. 123, Jakarta',
                'is_active' => 'active',
            ]);

            $owner->store_id = $store->id;
            $owner->save();

            $this->command->info("Store created for: {$owner->name}");
        }

        // Juga untuk super admin jika belum punya store
        $superAdmin = User::where('role', 'super_admin')->whereNull('store_id')->first();
        if ($superAdmin) {
            $store = Store::create([
                'user_id' => $superAdmin->id,
                'name' => 'Super Admin Store',
                'business_type' => 'retail',
                'country' => 'ID',
                'province' => 'DKI Jakarta',
                'address' => 'Super Admin Address',
                'is_active' => 'active',
            ]);

            $superAdmin->store_id = $store->id;
            $superAdmin->save();

            $this->command->info("Store created for: {$superAdmin->name}");
        }
    }
}