<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua owner yang punya store
        $owners = User::where('role', 'owner')->whereNotNull('store_id')->get();

        if ($owners->isEmpty()) {
            $this->command->warn('No owners with stores found. Skipping category seeding.');
            return;
        }

        $this->command->info('');
        $this->command->info('📦 Creating categories for each store with different content...');
        $this->command->info('');

        foreach ($owners as $owner) {
            $storeName = $owner->store->name ?? 'Unknown Store';
            $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            $this->command->info("🏪 Processing Store: {$storeName}");
            $this->command->info("👤 Owner: {$owner->name} ({$owner->email})");
            $this->command->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            // Tentukan categories berdasarkan email owner
            $categories = $this->getCategoriesByOwner($owner->email);

            foreach ($categories as $cat) {
                Category::updateOrCreate(
                    [
                        'name' => $cat['name'],
                        'store_id' => $owner->store_id,
                    ],
                    [
                        'slug' => Str::slug($cat['name'] . '-' . $owner->store_id . '-' . uniqid()),
                        'description' => $cat['description'],
                        'is_active' => $cat['is_active'] ?? true,
                        'sort_order' => $cat['sort_order'],
                        'store_id' => $owner->store_id,
                    ]
                );
                $this->command->line("   ✅ {$cat['name']} - {$cat['description']}");
            }
            
            $this->command->info("");
            $this->command->info("   📊 Total: " . count($categories) . " categories created for {$storeName}");
            $this->command->info("");
        }

        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅ Category seeder completed successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    /**
     * Get different categories based on owner email
     */
    private function getCategoriesByOwner(string $email): array
    {
        // Untuk Owner 1 (owner@jagamodal.com) - Fokus ke Elektronik & Fashion
        if ($email === 'owner@jagamodal.com') {
            return [
                ['name' => 'Smartphone & Aksesoris', 'description' => 'HP, casing, screen protector, power bank', 'sort_order' => 1, 'is_active' => true],
                ['name' => 'Laptop & Komputer', 'description' => 'Laptop, PC, monitor, keyboard, mouse', 'sort_order' => 2, 'is_active' => true],
                ['name' => 'Aksesoris Fashion Pria', 'description' => 'Jam tangan, kacamata, ikat pinggang', 'sort_order' => 3, 'is_active' => true],
                ['name' => 'Aksesoris Fashion Wanita', 'description' => 'Perhiasan, tas, sepatu, hijab', 'sort_order' => 4, 'is_active' => true],
                ['name' => 'Audio & Speaker', 'description' => 'Headphone, earphone, speaker portable', 'sort_order' => 5, 'is_active' => true],
                ['name' => 'Kamera & Drone', 'description' => 'DSLR, mirrorless, action cam, drone', 'sort_order' => 6, 'is_active' => false],
                ['name' => 'Smart Home', 'description' => 'Lampu pintar, kunci pintar, CCTV', 'sort_order' => 7, 'is_active' => true],
            ];
        }
        
        // Untuk Owner 2 (owner2@jagamodal.com) - Fokus ke Makanan & Rumah Tangga
        if ($email === 'owner2@jagamodal.com') {
            return [
                ['name' => 'Makanan Ringan', 'description' => 'Keripik, snack, biskuit, coklat', 'sort_order' => 1, 'is_active' => true],
                ['name' => 'Minuman', 'description' => 'Air mineral, jus, soda, kopi, teh', 'sort_order' => 2, 'is_active' => true],
                ['name' => 'Bumbu Dapur', 'description' => 'Bawang, cabai, rempah-rempah', 'sort_order' => 3, 'is_active' => true],
                ['name' => 'Perabotan Rumah', 'description' => 'Piring, gelas, panci, wajan', 'sort_order' => 4, 'is_active' => true],
                ['name' => 'Pembersih Rumah', 'description' => 'Sabun, deterjen, pemutih, pengharum', 'sort_order' => 5, 'is_active' => true],
                ['name' => 'Kebutuhan Bayi', 'description' => 'Popok, susu, baju bayi, mainan', 'sort_order' => 6, 'is_active' => true],
                ['name' => 'Peralatan Masak', 'description' => 'Blender, mixer, rice cooker, kompor', 'sort_order' => 7, 'is_active' => false],
                ['name' => 'Dekorasi Rumah', 'description' => 'Hiasan dinding, vas bunga, lampu hias', 'sort_order' => 8, 'is_active' => true],
            ];
        }
        
        // Untuk Super Admin jika dia juga memiliki store
        if ($email === 'admin@jagamodal.com') {
            return [
                ['name' => 'Administrasi', 'description' => 'Administrasi dan manajemen', 'sort_order' => 1, 'is_active' => true],
                ['name' => 'Laporan', 'description' => 'Laporan dan dokumentasi', 'sort_order' => 2, 'is_active' => true],
                ['name' => 'Pengaturan', 'description' => 'Pengaturan sistem', 'sort_order' => 3, 'is_active' => true],
            ];
        }
        
        // Default categories untuk owner lain
        return [
            ['name' => 'Produk Umum', 'description' => 'Produk umum', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'Layanan', 'description' => 'Layanan jasa', 'sort_order' => 2, 'is_active' => true],
        ];
    }
}