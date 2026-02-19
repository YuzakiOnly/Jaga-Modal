<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class StoreSetupController extends Controller
{
    /**
     * Tampilkan halaman setup toko.
     * Hanya bisa diakses jika ada pending_user_id di session (baru saja register).
     */
    public function show()
    {
        if (!Session::has('pending_user_id')) {
            return redirect('/register');
        }

        return Inertia::render('auth/SetupStore', [
            'titlePage' => 'Setup Your Store',
        ]);
    }

    /**
     * Simpan data toko, lalu login user dan arahkan ke dashboard.
     */
    public function store(Request $request)
    {
        $userId = Session::get('pending_user_id');

        if (!$userId) {
            return redirect('/register')->withErrors(['session' => 'Session expired. Please register again.']);
        }

        $request->validate([
            'business_type' => ['required', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:10'],
            'province' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $user = User::findOrFail($userId);

        Store::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'business_type' => $request->business_type,
            'country' => $request->country,
            'province' => $request->province,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        // Hapus session sementara
        Session::forget('pending_user_id');

        // Login user
        Auth::login($user);

        $locale = $user->locale ?? config('app.locale', 'en');
        App::setLocale($locale);
        Session::put('locale', $locale);
        Session::save();

        $request->session()->regenerate();

        return Inertia::location('/');
    }
}