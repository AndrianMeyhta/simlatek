<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\permintaantahapan;

class tahapancontroller extends Controller
{
    public function index()
    {
        return response()->json(['data' => permintaantahapan::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);
        $permintaantahapan = permintaantahapan::create($request->all());

        return response()->json([
            'data' => permintaantahapan::all(),
            'message' => 'Project tahapan created successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
        ]);
        $permintaantahapan = permintaantahapan::findOrFail($id);
        $permintaantahapan->update($request->all());

        return response()->json(['data' => permintaantahapan::all()]);
    }

    public function destroy($id)
    {
        $permintaantahapan = permintaantahapan::findOrFail($id);
        $permintaantahapan->delete();

        return response()->json(['data' => permintaantahapan::all()]);
    }
}
