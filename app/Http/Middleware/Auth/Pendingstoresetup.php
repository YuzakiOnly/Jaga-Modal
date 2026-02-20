<?php

namespace App\Http\Middleware\Auth;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class PendingStoreSetup
{
    public function handle(Request $request, Closure $next)
    {
        if (Session::has('pending_user_id')) {
            $allowedRoutes = [
                'store.setup',
                'store.setup.save',
                'logout',
                'language.switch'
            ];

            if ($request->routeIs($allowedRoutes)) {
                return $next($request);
            }

            return redirect()->route('store.setup');
        }

        return $next($request);
    }
}