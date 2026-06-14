<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('capital_price_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('name');
            $table->string('product_name')->nullable();          
            $table->decimal('labor_cost', 12, 2)->default(0);    
            $table->decimal('overhead_cost', 12, 2)->default(0);
            $table->unsignedInteger('output_qty')->default(1); 
            $table->decimal('amount', 12, 2)->default(0);      
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['store_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capital_price_templates');
    }
};