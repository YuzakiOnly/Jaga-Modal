<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasStore
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user) {
            return $next($request);
        }

        if ($user->role === 'super_admin') {
            return $next($request);
        }

        if (!$user->store_id) {
            return redirect()->route('store.setup')
                ->with('warning', 'Please complete your store setup first.');
        }

        if ($user->store_id && !$user->store) {
            $user->store_id = null;
            $user->save();
            return redirect()->route('store.setup')
                ->with('error', 'Store not found. Please setup your store again.');
        }

        return $next($request);
    }
}