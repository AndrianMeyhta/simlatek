<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Skill;
use App\Models\UserSkill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class userskillcontroller extends Controller
{
    public function index()
    {
        return inertia('usermanagement', [
            'users' => User::with('role', 'skills')->get(),
            'roles' => Role::all(),
            'skills' => Skill::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'user' => $user->load('role'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'role_id' => 'required|exists:roles,id',
            'password' => $request->filled('password') ? 'string|min:8' : '',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diupdate',
            'user' => $user->load('role'),
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }

    public function addSkill(Request $request, User $user)
    {
        $validated = $request->validate([
            'skill_id' => [
                'required',
                'exists:skills,id',
                function ($attribute, $value, $fail) use ($user) {
                    if ($user->skills()->where('skill_id', $value)->exists()) {
                        $fail('User sudah memiliki skill ini.');
                    }
                },
            ],
            'level' => 'required|in:Beginner,Intermediate,Advanced,Expert',
            'experience_since' => 'nullable|date_format:Y|before_or_equal:' . date('Y'),
            'notes' => 'nullable|string',
        ]);

        $user->skills()->attach($validated['skill_id'], [
            'level' => $validated['level'],
            'experience_since' => $validated['experience_since'],
            'notes' => $validated['notes'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil ditambahkan ke user',
            'user' => $user->load('skills'),
        ]);
    }

    public function updateSkill(Request $request, UserSkill $userSkill)
    {
        try {
            $validated = $request->validate([
                'level' => 'required|in:Beginner,Intermediate,Advanced,Expert',
                'experience_since' => 'nullable|date_format:Y|before_or_equal:' . date('Y'),
                'notes' => 'nullable|string',
            ]);

            $userSkill->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'User skill berhasil diupdate',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user skill: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function removeSkill(UserSkill $userSkill)
    {
        try {
            $userSkill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Skill berhasil dihapus dari user',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user skill: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getUser(User $user)
    {
        return response()->json([
            'success' => true,
            'user' => $user->load(['role', 'skills' => function ($query) {
                $query->withPivot('id', 'level', 'experience_since', 'notes');
            }]),
        ]);
    }

    public function getUsersWithSkill($skillId)
    {
        try {
            $skill = Skill::with(['users' => function ($query) {
                $query->select('users.id', 'users.name')
                    ->withPivot('level');
            }])->findOrFail($skillId);

            return response()->json($skill->users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }
}
