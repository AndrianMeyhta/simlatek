<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class UserSessionMiddleware
{
    private array $rolePermissions = [
        'superadmin' => [
            'manage', 'permintaan', 'dashboard', 'project', 'constrain',
            'user-management', 'users', 'skills', 'user-skills', 'aplikasi'
        ],
        'nonSuperadmin' => [
            'permintaan', 'dashboard', 'project', 'active-permintaans'
        ],
    ];

    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();
        $role = strtolower($user->role->name ?? 'user'); // lowercase biar aman

        $currentRoute = $request->route()->uri();

        // Superadmin punya akses penuh
        if ($role === 'superadmin') {
            $permissions = $this->rolePermissions['superadmin'];
        } else {
            // Semua selain superadmin dianggap nonSuperadmin
            $permissions = $this->rolePermissions['nonSuperadmin'];
        }

        // Cek apakah URI diawali dengan prefix yang diizinkan
        foreach ($permissions as $allowedPrefix) {
            if (str_starts_with($currentRoute, $allowedPrefix)) {
                return $next($request);
            }
        }

        return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
    }
}
