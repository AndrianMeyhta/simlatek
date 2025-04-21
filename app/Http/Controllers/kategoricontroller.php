<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dokumenkategori;
use Inertia\Inertia;

class kategoricontroller extends Controller
{
    public function index()
    {
        return response()->json(['data' => DokumenKategori::all()]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $dokumenkategori = Dokumenkategori::create($request->all());

        return response()->json([
            'data' => Dokumenkategori::all(),
            'message' => 'Dokumen kategori created successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $dokumenkategori = Dokumenkategori::findOrFail($id);
        $dokumenkategori->update($request->all());

        return response()->json(['data' => Dokumenkategori::all()]);
    }

    public function destroy($id)
    {
        $dokumenkategori = Dokumenkategori::findOrFail($id);
        $dokumenkategori->delete();

        return response()->json(['data' => Dokumenkategori::all()]);
    }
}
