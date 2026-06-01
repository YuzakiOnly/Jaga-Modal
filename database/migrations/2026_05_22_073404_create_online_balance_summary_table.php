<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('online_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->decimal('total_balance', 15, 2)->default(0);
            $table->json('channel_breakdown')->nullable();
            $table->timestamps();

            $table->unique('store_id');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('payment_source', ['cash', 'online'])->default('cash')->after('type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('online_balances');

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('payment_source');
        });
    }
};