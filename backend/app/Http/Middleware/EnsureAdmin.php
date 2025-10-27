<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    /**
     * Allow only authenticated users with is_admin = true.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! $user->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Admins only.'
            ], 403);
        }

        return $next($request);
    }
}