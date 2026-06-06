<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();

            $table->unsignedInteger('customer_number');

            $table->string('name')->nullable();
            $table->string('phone', 20)->nullable();

            $table->timestamps();

            $table->unique(['store_id', 'customer_number']);
            $table->index(['store_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};