<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class skillcontroller extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills',
            'description' => 'nullable|string',
            'category' => 'required|in:Development,Tester,Management,Other',
        ]);

        $skill = Skill::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
        ]);
    }

    /**
     * Update the specified skill in the database.
     */
    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:skills,name,' . $skill->id,
            ],
            'description' => 'nullable|string',
            'category' => 'required|in:Development,Tester,Management,Other',
        ]);

        $skill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil diupdate',
        ]);
    }

    /**
     * Remove the specified skill from the database.
     */
    public function destroy(Skill $skill)
    {
        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil dihapus',
        ]);
    }
}
