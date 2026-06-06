<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\StoreSetupController;
use App\Http\Controllers\Cashier\CashierController;
use App\Http\Controllers\Cashier\CashierDashboardController;
use App\Http\Controllers\Cashier\CashierExpenseController;
use App\Http\Controllers\Cashier\CashierHistoryController;
use App\Http\Controllers\Language\LanguageController;
use App\Http\Controllers\Owner\CapitalPriceTemplateController;
use App\Http\Controllers\Owner\CategoryController;
use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\ExpenseController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\TransactionController;
use App\Http\Controllers\Owner\MarketDataController;
use App\Http\Controllers\Owner\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Root redirect berdasarkan role ─────────────────────────────────────────
Route::get('/', function () {
    if (auth()->check()) {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return redirect('/admin/dashboard');
        }

        if ($user->isOwner()) {
            return redirect('/cashier');
        }

        if ($user->isCashier()) {
            return redirect('/cashier');
        }

        return redirect('/login');
    }

    return redirect('/login');
});

// ── Guest routes ──────────────────────────────────────────────────────────
Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// ── Pending store setup ───────────────────────────────────────────────────
Route::middleware(['pending.store'])->group(function () {
    Route::get('/verify-phone', [AuthController::class, 'showVerifyPhone'])->name('verify.phone');
    Route::post('/verify-phone', [AuthController::class, 'verify'])->name('verify.phone.submit');
    Route::post('/verify-phone/resend', [AuthController::class, 'resendCode'])->name('verify.phone.resend');
});

Route::middleware(['pending.store'])->group(function () {
    Route::get('/setup-store', [StoreSetupController::class, 'show'])->name('store.setup');
    Route::post('/setup-store', [StoreSetupController::class, 'store'])->name('store.setup.save');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── Cashier (akses untuk cashier, owner, super_admin) ─────────────────────
Route::middleware(['auth', 'role:cashier,owner', 'ensure.store'])
    ->prefix('cashier')
    ->group(function () {
        Route::get('/dashboard', [CashierDashboardController::class, 'index'])
            ->name('cashier.dashboard');

        Route::get('/', [CashierController::class, 'index'])
            ->name('cashier.pos');

        Route::post('/transactions', [CashierController::class, 'store'])
            ->name('cashier.transactions.store');

        Route::post('/stock-adjust', [CashierController::class, 'stockAdjust'])
            ->name('cashier.stock-adjust');

        Route::get('/history', [CashierHistoryController::class, 'index'])
            ->name('cashier.history');

        Route::get('/expenses', [CashierExpenseController::class, 'index'])
            ->name('cashier.expenses');

        Route::post('/expenses', [CashierExpenseController::class, 'store'])
            ->name('cashier.expenses.store');

        Route::delete('/expenses/{expense}', [CashierExpenseController::class, 'destroy'])
            ->name('cashier.expenses.destroy');
    });

// ── Owner (akses untuk owner, super_admin) ────────────────────────────────
Route::middleware(['auth', 'role:ownerSS', 'ensure.store'])
    ->prefix('owner')
    ->group(function () {
        Route::get('/', function () {
            return redirect('/owner/dashboard');
        });

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('owner.dashboard');

        // ── Kategori produk ─────────────────────────────────────────────
        Route::get('/categories', [CategoryController::class, 'index'])->name('owner.categories');
        Route::get('/categories/create', [CategoryController::class, 'create'])->name('owner.categories.create');
        Route::post('/categories', [CategoryController::class, 'store'])->name('owner.categories.store');
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('owner.categories.edit');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('owner.categories.update');
        Route::patch('/categories/{category}/toggle', [CategoryController::class, 'toggleActive'])->name('owner.categories.toggle');
        Route::post('/categories/reorder', [CategoryController::class, 'reorder'])->name('owner.categories.reorder');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('owner.categories.destroy');

        // ── Produk ──────────────────────────────────────────────────────
        Route::get('/products', [ProductController::class, 'index'])->name('owner.products');
        Route::get('/products/create', [ProductController::class, 'create'])->name('owner.products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('owner.products.store');
        Route::post('/products/stock-adjust', [ProductController::class, 'stockAdjust'])->name('owner.products.stock-adjust');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('owner.products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('owner.products.update');
        Route::patch('/products/{product}/toggle', [ProductController::class, 'toggleActive'])->name('owner.products.toggle');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('owner.products.destroy');

        // ── Harga modal ─────────────────────────────────────────────────
        Route::get('/capital-prices', [CapitalPriceTemplateController::class, 'index'])->name('owner.capital-prices');
        Route::get('/capital-prices/options', [CapitalPriceTemplateController::class, 'options'])->name('owner.capital-prices.options');
        Route::get('/capital-prices/create', [CapitalPriceTemplateController::class, 'create'])->name('owner.capital-prices.create');
        Route::post('/capital-prices', [CapitalPriceTemplateController::class, 'store'])->name('owner.capital-prices.store');
        Route::get('/capital-prices/{capitalPrice}/edit', [CapitalPriceTemplateController::class, 'edit'])->name('owner.capital-prices.edit');
        Route::put('/capital-prices/{capitalPrice}', [CapitalPriceTemplateController::class, 'update'])->name('owner.capital-prices.update');
        Route::patch('/capital-prices/{capitalPrice}/toggle', [CapitalPriceTemplateController::class, 'toggleActive'])->name('owner.capital-prices.toggle');
        Route::delete('/capital-prices/{capitalPrice}', [CapitalPriceTemplateController::class, 'destroy'])->name('owner.capital-prices.destroy');

        // ── POS & Transaksi ─────────────────────────────────────────────
        Route::get('/pos', [TransactionController::class, 'index'])->name('owner.pos');
        Route::post('/pos/transactions', [TransactionController::class, 'store'])->name('owner.transactions.store');
        Route::get('/pos/history', [TransactionController::class, 'history'])->name('owner.transactions.history');

        // ── Pengeluaran ─────────────────────────────────────────────────
        Route::get('/expenses', [ExpenseController::class, 'index'])->name('owner.expenses');
        Route::post('/expenses', [ExpenseController::class, 'store'])->name('owner.expenses.store');
        Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->name('owner.expenses.update');
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('owner.expenses.destroy');

        Route::get('/wallet', [WalletController::class, 'index'])->name('owner.wallet');
        Route::get('/wallet/create', [WalletController::class, 'create'])->name('owner.wallet.create');
        Route::post('/wallet', [WalletController::class, 'store'])->name('owner.wallet.store');
        Route::post('/wallet/spend', [WalletController::class, 'storeSpend'])->name('owner.wallet.spend');
        Route::post('/wallet/send-to-store', [WalletController::class, 'storeSendToStore'])->name('owner.wallet.send-to-store');
        Route::get('/wallet/{walletTransaction}/edit', [WalletController::class, 'edit'])->name('owner.wallet.edit');
        Route::put('/wallet/{walletTransaction}', [WalletController::class, 'update'])->name('owner.wallet.update');
        Route::delete('/wallet/{walletTransaction}', [WalletController::class, 'destroy'])->name('owner.wallet.destroy');
    });

// ── Super Admin ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/', function () {
            return redirect('/admin/dashboard');
        });

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('admin.dashboard');

        Route::get('/users', [UserController::class, 'index'])->name('admin.users');
        Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    });

// ── Language ───────────────────────────────────────────────────────────────
Route::post('/language/switch', [LanguageController::class, 'switch'])->name('language.switch');

// ── Fallback ──────────────────────────────────────────────────────────────
Route::fallback(function () {
    return Inertia::render('errors/NotFound');
});