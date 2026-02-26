<?php

use App\Http\Middleware\Auth\PendingStoreSetup;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Language\EnsureLocaleIsConsistent;
use App\Http\Middleware\Language\SetLocale;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            SetLocale::class,
            EnsureLocaleIsConsistent::class,
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'pending.store' => PendingStoreSetup::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            return Inertia::render('errors/NotFound', ['status' => 404])
                ->toResponse($request)
                ->setStatusCode(404);
        });

        $exceptions->render(function (AccessDeniedHttpException $e, $request) {
            return Inertia::render('errors/NotFound', ['status' => 403])
                ->toResponse($request)
                ->setStatusCode(403);
        });

        // Tangkap semua HTTP error lainnya (401, 500, dst)
        $exceptions->render(function (HttpException $e, $request) {
            return Inertia::render('errors/NotFound', ['status' => $e->getStatusCode()])
                ->toResponse($request)
                ->setStatusCode($e->getStatusCode());
        });
    })->create();