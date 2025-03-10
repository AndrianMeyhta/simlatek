<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class UserSessionMiddleware
{
    private array $rolePermissions = [
        'Superadmin' => ['manage', 'permintaan', 'dashboard', 'project', 'constrain'],
        'OPD' => ['permintaan', 'dashboard', 'project'],
    ];

    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();
        $role = $user->role->name ?? 'User';

        $currentRoute = $request->route()->uri();

        if (isset($this->rolePermissions[$role])) {
            foreach ($this->rolePermissions[$role] as $allowedPrefix) {
                if (str_starts_with($currentRoute, $allowedPrefix)) {
                    return $next($request);
                }
            }
        }

        return response()->json([
            'message' => 'Forbidden: Anda tidak memiliki izin untuk mengakses halaman ini.',
        ], Response::HTTP_FORBIDDEN);
    }
}
