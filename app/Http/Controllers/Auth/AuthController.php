<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PhoneVerificationCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AuthController extends Controller
{

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

    public function showVerifyPhone()
    {
        if (!Session::has('pending_registration')) {
            return redirect('/register');
        }

        $phone = Session::get('pending_registration.phone');
        $countryCode = Session::get('pending_registration.country_code');

        $maskedPhone = $countryCode . ' ' . $this->maskPhone($phone);

        return Inertia::render('auth/VerifyPhone', [
            'titlePage' => 'Verify Your Phone',
            'phone' => $maskedPhone,
            'raw_phone' => $phone,
        ]);
    }

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
        $countryCode = ltrim($request->country_code, '+');
        $localPhone = ltrim($request->phone, '0');
        $fullPhone = $countryCode . $localPhone;

        if (User::where('phone', $fullPhone)->exists()) {
            return back()->withErrors([
                'phone' => 'This phone number is already registered.',
            ])->onlyInput('name', 'username', 'email', 'country_code');
        }

        Session::put('pending_registration', [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'country_code' => $request->country_code,
            'phone' => $fullPhone,
            'password' => Hash::make($request->password),
            'locale' => $locale,
        ]);
        Session::save();

        $this->sendVerificationCode($fullPhone, $request->name);

        return Inertia::location(route('verify.phone'));
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $pending = Session::get('pending_registration');

        if (!$pending) {
            return back()->withErrors([
                'error' => 'Your registration session has expired. Please register again.',
            ])->withInput();
        }

        $record = PhoneVerificationCode::where('phone', $pending['phone'])
            ->where('code', $request->code)
            ->latest()
            ->first();

        if (!$record) {
            return back()->withErrors([
                'code' => 'The verification code you entered is incorrect.',
            ])->withInput();
        }

        if ($record->isExpired()) {
            $record->delete();
            return back()->withErrors([
                'code' => 'This verification code has expired. Please request a new one.',
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
            'phone_verified_at' => now(),
        ]);

        Session::forget('pending_registration');

        Session::put('pending_user_id', $user->id);
        Session::put('locale', $user->locale);
        Session::save();

        return redirect()->route('store.setup')->with([
            'success' => 'Phone verified successfully! Please set up your store.',
        ]);
    }

    public function resendCode(Request $request)
    {
        $pending = Session::get('pending_registration');

        if (!$pending) {
            return response()->json(['message' => 'Session expired.'], 422);
        }

        $this->sendVerificationCode($pending['phone'], $pending['name']);

        return response()->json(['message' => 'Verification code resent to your WhatsApp/SMS.']);
    }

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

    private function sendVerificationCode(string $phone, string $name): void
    {
        // Delete old codes for this phone
        PhoneVerificationCode::where('phone', $phone)->delete();

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PhoneVerificationCode::create([
            'phone' => $phone,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        $provider = config('services.otp.provider', 'twilio');

        match ($provider) {
            'twilio' => $this->sendViaTwilio($phone, $code, $name),
            'fonnte' => $this->sendViaFonnte($phone, $code, $name),
            'wablas' => $this->sendViaWablas($phone, $code, $name),
            default => $this->sendViaTwilio($phone, $code, $name),
        };
    }

    private function sendViaTwilio(string $phone, string $code, string $name): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $verifySid = config('services.twilio.verify_sid');

        $message = "Hi {$name}, your verification code is: *{$code}*\n\nThis code expires in 10 minutes. Do not share this code with anyone.";

        Http::withBasicAuth($sid, $token)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => 'whatsapp:' . config('services.twilio.whatsapp_from'),
                'To' => 'whatsapp:' . $phone,
                'Body' => $message,
            ]);
    }

    private function sendViaFonnte(string $phone, string $code, string $name): void
    {
        $message = "Halo {$name}, kode verifikasi Anda adalah: *{$code}*\n\nKode ini berlaku 10 menit. Jangan bagikan kode ini kepada siapapun.";

        Http::withoutVerifying()
            ->withHeaders([
                'Authorization' => config('services.fonnte.token'),
            ])->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => $message,
                    'countryCode' => '62',
                ]);
    }

    private function sendViaWablas(string $phone, string $code, string $name): void
    {
        $message = "Halo {$name}, kode verifikasi Anda adalah: *{$code}*\n\nKode ini berlaku 10 menit. Jangan bagikan kode ini kepada siapapun.";

        Http::withHeaders([
            'Authorization' => config('services.wablas.token'),
        ])->post(config('services.wablas.domain') . '/api/send-message', [
                    'phone' => $phone,
                    'message' => $message,
                ]);
    }

    private function maskPhone(string $fullPhone): string
    {
        $digits = preg_replace('/^\+\d{1,3}/', '', $fullPhone);
        $len = strlen($digits);

        if ($len <= 4)
            return str_repeat('*', $len);

        return str_repeat('*', $len - 4) . substr($digits, -4);
    }
}