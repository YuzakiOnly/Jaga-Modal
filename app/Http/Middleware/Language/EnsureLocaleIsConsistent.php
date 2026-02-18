<?php

namespace App\Http\Middleware\Language;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class EnsureLocaleIsConsistent
{
    public function handle(Request $request, Closure $next)
    {
        $availableLocales = config('app.available_locales', ['id', 'en', 'ja']);

        if (Auth::check()) {
            $user = Auth::user();
            if ($user->locale && in_array($user->locale, $availableLocales)) {
                if (Session::get('locale') !== $user->locale) {
                    Session::put('locale', $user->locale);
                    App::setLocale($user->locale);
                }
            }
        }

        return $next($request);
    }
}