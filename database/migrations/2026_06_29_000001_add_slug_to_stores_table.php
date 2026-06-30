<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        $this->backfillSlugs();

        Schema::table('stores', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }

    private function backfillSlugs(): void
    {
        $stores = \DB::table('stores')->orderBy('id')->get(['id', 'name']);

        foreach ($stores as $store) {
            $base = Str::slug($store->name) ?: 'store';
            $slug = $base;
            $suffix = 1;

            while (
                \DB::table('stores')
                    ->where('slug', $slug)
                    ->where('id', '!=', $store->id)
                    ->exists()
            ) {
                $suffix++;
                $slug = "{$base}-{$suffix}";
            }

            \DB::table('stores')->where('id', $store->id)->update(['slug' => $slug]);
        }
    }
};