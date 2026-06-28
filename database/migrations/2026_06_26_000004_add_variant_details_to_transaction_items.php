<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            if (!Schema::hasColumn('transaction_items', 'variant_details')) {
                $table->json('variant_details')->nullable()->after('subtotal');
            }
            if (!Schema::hasColumn('transaction_items', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            if (Schema::hasColumn('transaction_items', 'variant_details')) {
                $table->dropColumn('variant_details');
            }
            if (Schema::hasColumn('transaction_items', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};