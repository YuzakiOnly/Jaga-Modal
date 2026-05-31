<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasStore
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        // Jika user tidak login, lanjutkan ke middleware auth berikutnya
        if (!$user) {
            return $next($request);
        }

        // Super admin doesn't need a store
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Check if user has store_id
        if (!$user->store_id) {
            return redirect()->route('store.setup')
                ->with('warning', 'Please complete your store setup first.');
        }

        // Optional: Verify the store actually exists
        if ($user->store_id && !$user->store) {
            // Store doesn't exist, clear the store_id
            $user->store_id = null;
            $user->save();
            return redirect()->route('store.setup')
                ->with('error', 'Store not found. Please setup your store again.');
        }

        return $next($request);
    }
}