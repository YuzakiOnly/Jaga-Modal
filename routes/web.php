<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Language\LanguageController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\StoreSetupController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::middleware(['pending.store'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('public/Home');
    });

    Route::middleware(['guest'])->group(function () {
        Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);

        Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [AuthController::class, 'register']);
    });

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    });
});

Route::middleware(['pending.store'])->group(function () {
    Route::get('/setup-store', [StoreSetupController::class, 'show'])->name('store.setup');
    Route::post('/setup-store', [StoreSetupController::class, 'store'])->name('store.setup.save');
});

Route::post('/language/switch', [LanguageController::class, 'switch'])
    ->name('language.switch');