<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Language\LanguageController;
use App\Http\Controllers\Auth\StoreSetupController;
use App\Http\Controllers\ProfileController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/login');
});

// Owner & super_admin
Route::middleware(['auth', 'role:owner,super_admin'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('owner/dashboard/Dashboard'))->name('dashboard');
    Route::get('/store', fn() => Inertia::render('owner/store/Store'))->name('store');
    Route::get('/revenue', fn() => Inertia::render('owner/revenue/Revenue'))->name('revenue');
    Route::get('/categories', fn() => Inertia::render('owner/categories/Categories'))->name('categories');
    Route::get('/products', fn() => Inertia::render('owner/products/Products'))->name('products');
    Route::get('/orders', fn() => Inertia::render('owner/orders/Orders'))->name('orders');
    Route::get('/orders/pending', fn() => Inertia::render('owner/orders/Pending'))->name('orders.pending');
    Route::get('/orders/completed', fn() => Inertia::render('owner/orders/Completed'))->name('orders.completed');
    Route::get('/settings', fn() => Inertia::render('owner/settings/Settings'))->name('settings');
});

// Profile routes (semua user yang sudah auth)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Khusus super_admin
Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('admin/dashboard/page'))->name('admin.dashboard');
    Route::get('/analytics', fn() => Inertia::render('admin/analytics/page'))->name('admin.analytics');
    Route::get('/reports', fn() => Inertia::render('admin/reports/page'))->name('admin.reports');

    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    Route::get('/users/roles', fn() => Inertia::render('admin/users/page'))->name('admin.users.roles');
    Route::get('/security', fn() => Inertia::render('admin/security/page'))->name('admin.security');
});

Route::middleware(['pending.store'])->group(function () {

    Route::middleware(['guest'])->group(function () {
        Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'login']);

        Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [AuthController::class, 'register']);
    });

    Route::get('/verify-phone', [AuthController::class, 'showVerifyPhone'])->name('verify.phone');
    Route::post('/verify-phone', [AuthController::class, 'verify'])->name('verify.phone.submit');
    Route::post('/verify-phone/resend', [AuthController::class, 'resendCode'])->name('verify.phone.resend');

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});

Route::middleware(['pending.store'])->group(function () {
    Route::get('/setup-store', [StoreSetupController::class, 'show'])->name('store.setup');
    Route::post('/setup-store', [StoreSetupController::class, 'store'])->name('store.setup.save');
});

Route::post('/language/switch', [LanguageController::class, 'switch'])
    ->name('language.switch');

Route::fallback(function () {
    return Inertia::render('errors/NotFound');
});