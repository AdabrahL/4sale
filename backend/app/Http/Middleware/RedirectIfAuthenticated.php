<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * If the user is authenticated, redirect them away from auth pages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|array|null  $guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $guards = null)
    {
        $guards = Arr::wrap($guards);

        foreach ($guards as $guard) {
            if (auth()->guard($guard)->check()) {
                return redirect('/'); // adjust to your home route if needed
            }
        }

        return $next($request);
    }
}