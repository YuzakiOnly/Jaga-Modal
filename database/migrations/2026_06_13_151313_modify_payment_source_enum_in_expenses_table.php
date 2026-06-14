<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE expenses MODIFY COLUMN payment_source ENUM('cash', 'online', 'dine_in', 'grabfood', 'shopeefood', 'gobiz') DEFAULT 'cash'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE expenses MODIFY COLUMN payment_source ENUM('cash', 'online') DEFAULT 'cash'");
    }
};