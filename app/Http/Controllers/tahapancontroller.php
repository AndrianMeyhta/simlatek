<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\projecttahapan;

class tahapancontroller extends Controller
{
    public function index()
    {
        return response()->json(['data' => projecttahapan::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);
        $projecttahapan = projecttahapan::create($request->all());

        return response()->json([
            'data' => projecttahapan::all(),
            'message' => 'Project tahapan created successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);
        $projecttahapan = projecttahapan::findOrFail($id);
        $projecttahapan->update($request->all());

        return response()->json(['data' => projecttahapan::all()]);
    }

    public function destroy($id)
    {
        $projecttahapan = projecttahapan::findOrFail($id);
        $projecttahapan->delete();

        return response()->json(['data' => projecttahapan::all()]);
    }
}
