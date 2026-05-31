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

            // Nullable: null berarti item custom (tidak ada di menu)
            $table->foreignId('product_id')
                ->nullable()
                ->constrained('products')
                ->nullOnDelete();

            // Nama & harga disimpan sendiri agar history tidak berubah
            // walau produk diedit/dihapus di kemudian hari
            $table->string('name');                              // nama produk saat transaksi
            $table->boolean('is_custom')->default(false);        // true = item tidak ada di menu

            $table->decimal('unit_price', 12, 2)->default(0);   // harga satuan saat transaksi
            $table->decimal('capital_price', 12, 2)->default(0); // HPP saat transaksi (untuk laporan laba)
            $table->unsignedInteger('qty')->default(1);
            $table->decimal('discount', 12, 2)->default(0);     // diskon per item (nominal)
            $table->decimal('subtotal', 12, 2)->default(0);     // (unit_price - discount) * qty

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};