<?php

namespace App\Http\Middleware\Language;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $defaultLocale = config('app.locale', 'en');
        $availableLocales = config('app.available_locales', ['id', 'en', 'ja']);

        $locale = $defaultLocale;

        if (Session::has('locale')) {
            $sessionLocale = Session::get('locale');
            if (in_array($sessionLocale, $availableLocales)) {
                $locale = $sessionLocale;
            }
        }
        elseif (Auth::check()) {
            $user = Auth::user();
            if ($user && isset($user->locale) && in_array($user->locale, $availableLocales)) {
                $locale = $user->locale;
                Session::put('locale', $locale);
            }
        }

        App::setLocale($locale);

        if (!Session::has('locale')) {
            Session::put('locale', $locale);
            Session::save();
        }

        return $next($request);
    }
}