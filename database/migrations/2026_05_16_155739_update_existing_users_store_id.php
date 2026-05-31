<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Update store_id for users who have stores
        DB::table('users')
            ->join('stores', 'users.id', '=', 'stores.user_id')
            ->whereNull('users.store_id')
            ->update(['users.store_id' => DB::raw('stores.id')]);
    }

    public function down(): void
    {
        // Tidak perlu rollback
    }
};