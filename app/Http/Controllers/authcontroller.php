<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class authcontroller extends Controller
{
    public function showLogin()
    {
        return Inertia::render('login');
    }

    // Proses login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            // Simpan data di session
            session([
                'username' => $user->name,
                'role' => $user->role->name ?? 'User', // Jika ada relasi role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->name ?? 'User',
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email atau password salah',
        ], 401);
    }

    // Proses logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }
}
