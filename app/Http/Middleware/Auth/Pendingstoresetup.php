<?php

namespace App\Http\Middleware\Auth;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class PendingStoreSetup
{
    public function handle(Request $request, Closure $next)
    {
        // Jika tidak ada pending_user_id, redirect ke register
        if (!Session::has('pending_user_id')) {
            return redirect()->route('register');
        }

        return $next($request);
    }
}