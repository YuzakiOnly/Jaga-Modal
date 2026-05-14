<?php

namespace Database\Seeders;

use App\Models\InviteCode;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InviteCodeSeeder extends Seeder
{
    /**
     * Jalankan: php artisan db:seed --class=InviteCodeSeeder
     * Generate 20 kode invite siap pakai
     */
    public function run(): void
    {
        $codes = [];

        for ($i = 0; $i < 20; $i++) {
            $codes[] = [
                'code' => strtoupper(Str::random(8)),
                'is_used' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        InviteCode::insert($codes);

        $this->command->info('✅ 20 invite codes generated:');
        InviteCode::where('is_used', false)->get()->each(function ($c) {
            $this->command->line("  → {$c->code}");
        });
    }
}