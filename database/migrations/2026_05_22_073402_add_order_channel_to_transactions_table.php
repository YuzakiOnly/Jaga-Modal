<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('order_channel')->default('dine_in')->after('payment_method');
            $table->string('payment_method', 20)->default('cash')->change();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('order_channel');
            $table->enum('payment_method', ['cash', 'qris'])->default('cash')->change();
        });
    }
};