<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Language\LanguageController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\StoreSetupController;
use App\Http\Controllers\StoreController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('public/Home');
});

Route::get('/admin/dashboard', function () {
    return Inertia::render('admin/dashboard/Dashboard');
});

Route::middleware(['pending.store'])->group(function () {
    Route::get('/profile', function () {
        return Inertia::render('public/Profile');
    });

    Route::middleware(['guest'])->group(function () {
        Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);

        Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [AuthController::class, 'register']);
    });

    Route::get('/verify-email', [AuthController::class, 'showVerifyEmail'])->name('verify.email');
    Route::post('/verify-email', [AuthController::class, 'verify'])->name('verify.email.submit');
    Route::post('/verify-email/resend', [AuthController::class, 'resendCode'])->name('verify.email.resend');

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::post('/store', [StoreController::class, 'update'])->name('store.update');
    });
});

Route::middleware(['pending.store'])->group(function () {
    Route::get('/setup-store', [StoreSetupController::class, 'show'])->name('store.setup');
    Route::post('/setup-store', [StoreSetupController::class, 'store'])->name('store.setup.save');
});

Route::post('/language/switch', [LanguageController::class, 'switch'])
    ->name('language.switch');