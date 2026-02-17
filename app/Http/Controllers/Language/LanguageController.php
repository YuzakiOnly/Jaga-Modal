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

        // Simpan ke session
        Session::put('locale', $locale);
        Session::save(); // ✅ Force save session sebelum response

        // Set locale untuk aplikasi
        App::setLocale($locale);

        // Simpan ke user jika login
        if (Auth::check()) {
            $user = Auth::user();
            if ($user) {
                $user->locale = $locale;
                $user->save();
            }
        }

        // ✅ Kembalikan JSON agar fetch() di frontend bisa cek response.ok
        if ($request->expectsJson() || $request->hasHeader('X-Inertia')) {
            return response()->json([
                'success' => true,
                'locale' => $locale,
            ]);
        }

        return back()->with('success', 'Language changed successfully');
    }
}