<?php

use App\Http\Middleware\Auth\PendingStoreSetup;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Language\EnsureLocaleIsConsistent;
use App\Http\Middleware\Language\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Daftar middleware untuk group web
        $middleware->web(append: [
            SetLocale::class,
            EnsureLocaleIsConsistent::class,
            HandleInertiaRequests::class,
        ]);

        // Daftar alias middleware dengan cara yang benar
        $middleware->alias([
            'pending.store' => PendingStoreSetup::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();