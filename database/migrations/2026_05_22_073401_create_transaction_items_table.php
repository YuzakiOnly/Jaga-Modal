<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();

            $table->foreignId('product_id')
                ->nullable()
                ->constrained('products')
                ->nullOnDelete();

            $table->string('name');                             
            $table->boolean('is_custom')->default(false);        

            $table->decimal('unit_price', 12, 2)->default(0);  
            $table->decimal('capital_price', 12, 2)->default(0);
            $table->unsignedInteger('qty')->default(1);
            $table->decimal('discount', 12, 2)->default(0);    
            $table->decimal('subtotal', 12, 2)->default(0);   

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};