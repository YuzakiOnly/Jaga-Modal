<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Views

    public function showLogin()
    {
        return Inertia::render('auth/Login', [
            'titlePage' => 'Login',
        ]);
    }

    public function showRegister()
    {
        return Inertia::render('auth/Register', [
            'titlePage' => 'Register',
        ]);
    }

    // Login

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $guestLocale = Session::get('locale');

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => __('auth.validation_email_password_invalid'),
            ])->onlyInput('email');
        }

        $user = Auth::user();

        $availableLocales = config('app.available_locales', ['id', 'en', 'ja']);

        if ($guestLocale && in_array($guestLocale, $availableLocales)) {
            $locale = $guestLocale;
            if ($user->locale !== $locale) {
                $user->locale = $locale;
                $user->save();
            }
        }
        elseif ($user->locale && in_array($user->locale, $availableLocales)) {
            $locale = $user->locale;
        }
        else {
            $locale = config('app.locale', 'en');
        }

        App::setLocale($locale);
        Session::put('locale', $locale);
        Session::save();

        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    // Register

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:20', 'unique:users', 'regex:/^[a-z0-9_]+$/'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'country_code' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', Password::defaults()],
        ], [
            'username.regex' => 'Username may only contain lowercase letters, numbers, and underscores.',
        ]);

        $locale = Session::get('locale', config('app.locale', 'en'));

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'country_code' => $request->country_code,
            'phone' => $request->country_code . $request->phone,
            'password' => Hash::make($request->password),
            'locale' => $locale,
        ]);

        Auth::login($user);
        Session::put('locale', $locale);
        Session::save();

        return redirect('/');
    }

    // Logout

    public function logout(Request $request)
    {
        $user = Auth::user();

        $userLocale = $user->locale ?? null;

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($userLocale) {
            Session::put('locale', $userLocale);
            Session::save();
            App::setLocale($userLocale);
        }

        return redirect('/login');
    }   
}