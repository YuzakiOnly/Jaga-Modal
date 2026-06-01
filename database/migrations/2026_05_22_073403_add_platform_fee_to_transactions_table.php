<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('platform_fee', 15, 2)->default(0)->after('discount');
            $table->decimal('net_revenue', 15, 2)->default(0)->after('platform_fee');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['platform_fee', 'net_revenue']);
        });
    }
};