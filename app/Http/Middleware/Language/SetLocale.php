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
        $defaultLocale = config('app.locale', 'id');
        $availableLocales = config('app.available_locales', ['id', 'en', 'ja']);

        if (Session::has('locale')) {
            $locale = Session::get('locale');

            if (in_array($locale, $availableLocales)) {
                App::setLocale($locale);
            } else {
                App::setLocale($defaultLocale);
                Session::put('locale', $defaultLocale);
            }

        } elseif (Auth::check()) {
            $user = Auth::user();

            if ($user && isset($user->locale) && in_array($user->locale, $availableLocales)) {
                App::setLocale($user->locale);
                Session::put('locale', $user->locale);
            } else {
                App::setLocale($defaultLocale);
                Session::put('locale', $defaultLocale);
            }

        } else {
            App::setLocale($defaultLocale);
            Session::put('locale', $defaultLocale);
        }

        return $next($request);
    }
}