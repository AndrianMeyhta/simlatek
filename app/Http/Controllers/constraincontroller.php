<?php

namespace App\Http\Controllers;

use App\Models\TahapanConstrain;
use App\Models\ProjectTahapan;
use App\Models\DokumenKategori;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ConstrainController extends Controller
{
    public function index()
    {
        $tahapans = ProjectTahapan::orderBy('id', 'asc')->get(['id', 'name']);
        $constraints = TahapanConstrain::with('projectTahapan')->get();
        $dokumenKategoris = DokumenKategori::all(['id', 'name']); // Data untuk dropdown

        return Inertia::render('constrain', [
            'tahapans' => $tahapans,
            'constraints' => $constraints,
            'dokumenKategoris' => $dokumenKategoris,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'projecttahapan_id' => 'required|exists:projecttahapans,id',
            'type' => 'required|in:schedule,upload_file,text',
            'name' => 'required|string|max:255',
            'required' => 'required|boolean',
            'target_table' => 'required|string',
            'target_column' => 'required|string',
            'dokumenkategori_id' => 'nullable|exists:dokumenkategoris,id',
            'relasi' => 'nullable|in:rapat,testing,rekomendasi,project',
            'isTesting' => 'nullable|boolean', // Tambahkan ini
            'testingtype' => 'nullable|in:Fungsi,Keamanan,Performa', // Tambahkan ini
        ]);

        $detail = [
            'name' => $request->name,
            'required' => $request->required,
            'target_table' => $request->target_table,
            'target_column' => $request->target_column,
            'dokumenkategori_id' => null,
            'relasi' => null,
            'isTesting' => $request->isTesting ?? false, // Tambahkan ini
        ];

        if ($request->type === 'upload_file') {
            $detail['dokumenkategori_id'] = $request->dokumenkategori_id;
            if ($request->relasi) {
                $detail['relasi'] = "App\\Models\\" . ucfirst($request->relasi);
            }
            if ($request->isTesting && $request->testingtype) {
                $detail['testingtype'] = $request->testingtype; // Hanya simpan jika isTesting true
            }
        } else {
            unset($detail['testingtype']); // Pastikan testingtype tidak ada jika bukan upload_file
        }

        $constraint = TahapanConstrain::create([
            'projecttahapan_id' => $request->projecttahapan_id,
            'name' => $request->name,
            'type' => $request->type,
            'detail' => $detail,
        ]);

        return response()->json([
            'message' => 'Constraint berhasil ditambahkan',
            'constraint' => $constraint->load('projectTahapan'),
        ], 201);
    }

    public function update(Request $request, TahapanConstrain $constraint)
    {
        $request->validate([
            'projecttahapan_id' => 'required|exists:projecttahapans,id',
            'type' => 'required|in:schedule,upload_file,text',
            'name' => 'required|string|max:255',
            'required' => 'required|boolean',
            'target_table' => 'required|string',
            'target_column' => 'required|string',
            'dokumenkategori_id' => 'nullable|exists:dokumenkategoris,id',
            'relasi' => 'nullable|in:rapat,testing,rekomendasi,project',
            'isTesting' => 'nullable|boolean', // Tambahkan ini
            'testingtype' => 'nullable|in:Fungsi,Keamanan,Performa', // Tambahkan ini
        ]);

        $detail = [
            'name' => $request->name,
            'required' => $request->required,
            'target_table' => $request->target_table,
            'target_column' => $request->target_column,
            'dokumenkategori_id' => $constraint->detail['dokumenkategori_id'] ?? null,
            'relasi' => $constraint->detail['relasi'] ?? null,
            'isTesting' => $request->isTesting ?? false, // Tambahkan ini
        ];

        if ($request->type === 'upload_file') {
            $detail['dokumenkategori_id'] = $request->dokumenkategori_id;
            if ($request->relasi) {
                $detail['relasi'] = "App\\Models\\" . ucfirst($request->relasi);
            }
            if ($request->isTesting && $request->testingtype) {
                $detail['testingtype'] = $request->testingtype; // Hanya simpan jika isTesting true
            } else {
                unset($detail['testingtype']); // Hapus jika tidak testing
            }
        } else {
            $detail['dokumenkategori_id'] = null;
            $detail['relasi'] = null;
            unset($detail['testingtype']); // Pastikan testingtype tidak ada jika bukan upload_file
        }

        $constraint->update([
            'projecttahapan_id' => $request->projecttahapan_id,
            'name' => $request->name,
            'type' => $request->type,
            'detail' => $detail,
        ]);

        return response()->json([
            'message' => 'Constraint berhasil diperbarui',
            'constraint' => $constraint->fresh('projectTahapan'),
        ], 201);
    }

    public function destroy(TahapanConstrain $constraint)
    {
        $constraint->delete();

        return response()->json([
            'message' => 'Constraint berhasil dihapus',
        ], 200);
    }
}
