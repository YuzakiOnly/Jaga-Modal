<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('capital_price_template_ingredients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('capital_price_template_id')
                ->constrained(
                    table: 'capital_price_templates',
                    indexName: 'cpti_template_fk'
                )
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('unit');
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('qty', 10, 3)->default(1);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capital_price_template_ingredients');
    }
};