<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('owner_wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // 'in'  = uang masuk ke dompet (dari withdrawal toko / topup manual)
            // 'out' = uang keluar dari dompet (pengeluaran pribadi)
            $table->enum('flow', ['in', 'out']);

            // Sumber uang masuk
            // 'withdrawal'   = ditarik dari kas toko (linked ke expense)
            // 'manual_topup' = tambah manual (terima piutang, dll)
            // 'personal_out' = pengeluaran pribadi
            $table->string('source')->default('withdrawal');

            $table->decimal('amount', 12, 2);
            $table->string('description');
            $table->text('notes')->nullable();

            // Link ke expense jika berasal dari withdrawal
            $table->foreignId('expense_id')
                ->nullable()
                ->constrained('expenses')
                ->nullOnDelete();

            $table->date('transacted_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['store_id', 'transacted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_wallet_transactions');
    }
};