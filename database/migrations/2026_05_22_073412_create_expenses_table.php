<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('type')->default('simple'); // simple, raw_material, salary
            $table->string('description');

            // Untuk simple expense
            $table->decimal('amount', 12, 2)->nullable();

            // Untuk raw material
            $table->decimal('quantity', 12, 2)->nullable();
            $table->decimal('unit_price', 12, 2)->nullable();

            // Untuk salary
            $table->string('employee_name')->nullable();
            $table->string('salary_period')->nullable();

            $table->date('expensed_at');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'expensed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};