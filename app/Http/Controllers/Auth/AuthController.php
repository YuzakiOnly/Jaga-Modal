<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

    public function showVerifyEmail()
    {
        if (!Session::has('pending_registration')) {
            return redirect('/register');
        }

        $email = Session::get('pending_registration.email');

        return Inertia::render('auth/VerifyEmail', [
            'titlePage' => 'Verify Your Email',
            'email' => $email,
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
        } elseif ($user->locale && in_array($user->locale, $availableLocales)) {
            $locale = $user->locale;
        } else {
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

        Session::put('pending_registration', [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'country_code' => $request->country_code,
            'phone' => $request->country_code . $request->phone,
            'password' => Hash::make($request->password),
            'locale' => $locale,
        ]);
        Session::save();

        $this->sendVerificationCode($request->email, $request->name);

        return Inertia::location(route('verify.email'));
    }

    // Email Verification 

    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $pending = Session::get('pending_registration');

        if (!$pending) {
            return back()->withErrors([
                'error' => 'Your registration session has expired. Please register again.'
            ])->withInput();
        }

        $record = EmailVerificationCode::where('email', $pending['email'])
            ->where('code', $request->code)
            ->latest()
            ->first();

        if (!$record) {
            return back()->withErrors([
                'code' => 'The verification code you entered is incorrect.'
            ])->withInput();
        }

        if ($record->isExpired()) {
            $record->delete();
            return back()->withErrors([
                'code' => 'This verification code has expired. Please request a new one.'
            ])->withInput();
        }
        
        $record->delete();

        $user = User::create([
            'name' => $pending['name'],
            'username' => $pending['username'],
            'email' => $pending['email'],
            'country_code' => $pending['country_code'],
            'phone' => $pending['phone'],
            'password' => $pending['password'],
            'locale' => $pending['locale'],
            'email_verified_at' => now(),
        ]);

        Session::forget('pending_registration');

        Session::put('pending_user_id', $user->id);
        Session::put('locale', $user->locale);
        Session::save();

        return redirect()->route('store.setup')->with([
            'success' => 'Email verified successfully! Please set up your store.'
        ]);
    }

    public function resendCode(Request $request)
    {
        $pending = Session::get('pending_registration');

        if (!$pending) {
            return response()->json(['message' => 'Session expired.'], 422);
        }

        $this->sendVerificationCode($pending['email'], $pending['name']);

        return response()->json(['message' => 'Verification code resent.']);
    }

    // Logout

    public function logout(Request $request)
    {
        $user = Auth::user();
        $userLocale = $user?->locale ?? null;

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

    // Helpers

    private function sendVerificationCode(string $email, string $name): void
    {
        EmailVerificationCode::where('email', $email)->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($email)->send(new VerificationCodeMail($code, $name));
    }
}