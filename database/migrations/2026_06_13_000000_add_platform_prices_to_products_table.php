<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('price_gobiz', 12, 2)->nullable()->after('selling_price');
            $table->decimal('price_grabfood', 12, 2)->nullable()->after('price_gobiz');
            $table->decimal('price_shopeefood', 12, 2)->nullable()->after('price_grabfood');
            $table->boolean('enable_online_food')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'price_gobiz',
                'price_grabfood',
                'price_shopeefood',
                'enable_online_food'
            ]);
        });
    }
};