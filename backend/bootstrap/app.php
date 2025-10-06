<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        then: function () {
            config([
                'cors' => [
                    'paths' => ['api/*', 'sanctum/csrf-cookie'],
                    'allowed_methods' => ['*'],
                    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')], // 👈 your React app
                    'allowed_headers' => ['*'],
                    'exposed_headers' => [],
                    'max_age' => 0,
                    'supports_credentials' => true,
                ],
            ]);
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
})

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
