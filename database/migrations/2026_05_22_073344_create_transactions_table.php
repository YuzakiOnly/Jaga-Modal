<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // kasir/owner yang input

            // Nomor transaksi unik per toko, e.g. TRX-20260522-0001
            $table->string('transaction_number')->unique();

            $table->enum('payment_method', ['cash', 'qris']);

            // Kalau cash: uang diterima & kembalian
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('change_amount', 12, 2)->default(0);

            $table->decimal('subtotal', 12, 2)->default(0);  // sebelum diskon
            $table->decimal('discount', 12, 2)->default(0);  // diskon nominal
            $table->decimal('total', 12, 2)->default(0);     // yang harus dibayar

            $table->enum('status', ['completed', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();

            $table->timestamp('transacted_at'); // waktu transaksi terjadi (bisa diisi manual)
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'transacted_at']);
            $table->index(['store_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};