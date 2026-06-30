<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class ValidateStoreSlug
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $slug = $request->route('storeSlug');

        if (!$user || !$slug) {
            abort(404);
        }

        if ($user->role === 'super_admin') {
            $store = Store::where('slug', $slug)->first();

            if (!$store) {
                abort(404);
            }

            $request->attributes->set('currentStore', $store);
            URL::defaults(['storeSlug' => $slug]);

            return $next($request);
        }

        if (!$user->store || $user->store->slug !== $slug) {
            abort(403, 'You do not have access to this store.');
        }

        $request->attributes->set('currentStore', $user->store);
        URL::defaults(['storeSlug' => $slug]);

        return $next($request);
    }
}