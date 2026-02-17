<?php

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class LanguageController extends Controller
{
    public function switch(Request $request)
    {
        $availableLocales = config('app.available_locales', ['id', 'en', 'ja']);

        $validated = $request->validate([
            'locale' => 'required|in:' . implode(',', $availableLocales)
        ]);

        $locale = $validated['locale'];

        Session::put('locale', $locale);
        Session::save();

        App::setLocale($locale);

        if (Auth::check()) {
            $user = Auth::user();
            if ($user) {
                $user->locale = $locale;
                $user->save();
            }
        }

        if ($request->expectsJson() || $request->hasHeader('X-Inertia')) {
            return response()->json([
                'success' => true,
                'locale' => $locale,
            ]);
        }

        return back()->with('success', 'Language changed successfully');
    }
}