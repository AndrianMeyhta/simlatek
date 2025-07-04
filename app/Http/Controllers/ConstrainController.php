<?php

namespace App\Http\Controllers;

use App\Models\TahapanConstrain;
use App\Models\PermintaanTahapan;
use App\Models\DokumenKategori;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ConstrainController extends Controller
{
    public function index()
    {
        $tahapans = PermintaanTahapan::orderBy('id', 'asc')->get(['id', 'name']);
        $constraints = TahapanConstrain::with('permintaantahapan')->get();
        $dokumenKategoris = DokumenKategori::all(['id', 'name']);

        return Inertia::render('constrain', [
            'tahapans' => $tahapans,
            'constraints' => $constraints,
            'dokumenKategoris' => $dokumenKategoris,
        ]);
    }

    public function store(Request $request)
    {
        // Validasi request sesuai struktur payload dari frontend
        $request->validate([
            'permintaantahapan_id' => 'required|exists:permintaantahapans,id',
            'type' => 'required|in:schedule,upload_file,text,progress',
            'name' => 'required|string|max:255',
            'detail.required' => 'required|boolean',
            'detail.target_table' => 'required|string',
            'detail.target_column' => 'required_if:type,schedule,text|string|nullable',
            'detail.target_columns' => 'required_if:type,progress|array|nullable',
            'detail.dokumenkategori_id' => 'nullable|exists:dokumenkategoris,id',
            'detail.relasi' => 'nullable|string', // Ubah ke string karena frontend mengirimkan namespace
            'detail.isTesting' => 'nullable|boolean',
            'detail.testingtype' => 'nullable|in:Fungsi,Keamanan,Performa',
            'detail.is_domain' => 'nullable|boolean', // Tambahkan validasi untuk is_domain
            'detail.domain_type' => 'required_if:detail.is_domain,true|in:sementara,live|nullable', // Tambahkan validasi untuk domain_type
        ]);

        $detail = [
            'name' => $request->name,
            'required' => $request->input('detail.required'),
            'target_table' => $request->input('detail.target_table'),
        ];

        if ($request->type === 'progress') {
            $detail['target_columns'] = $request->input('detail.target_columns', ['description', 'percentage_change']);
        } else {
            $detail['target_column'] = $request->input('detail.target_column');
        }

        if ($request->type === 'text' && $request->input('detail.is_domain')) {
            $detail['is_domain'] = $request->input('detail.is_domain');
            $detail['domain_type'] = $request->input('detail.domain_type');
        }

        if ($request->type === 'upload_file') {
            $detail['dokumenkategori_id'] = $request->input('detail.dokumenkategori_id');
            $detail['isTesting'] = $request->input('detail.isTesting', false);

            $relasi = $request->input('detail.relasi');
            if ($relasi) {
                $detail['relasi'] = 'App\\Models\\' . ucfirst($relasi);
            } else {
                $detail['relasi'] = null;
            }

            if ($request->input('detail.isTesting') && $request->input('detail.testingtype')) {
                $detail['testingtype'] = $request->input('detail.testingtype');
            }
        } else {
            $detail['dokumenkategori_id'] = null;
            $detail['relasi'] = null;
            if ($request->type !== 'text') {
                unset($detail['is_domain'], $detail['domain_type']);
            }
        }

        $constraint = TahapanConstrain::create([
            'permintaantahapan_id' => $request->permintaantahapan_id,
            'name' => $request->name,
            'type' => $request->type,
            'detail' => $detail,
        ]);

        return response()->json([
            'message' => 'Constraint berhasil ditambahkan',
            'constraint' => $constraint->load('permintaantahapan'),
        ], 201);
    }

    public function update(Request $request, TahapanConstrain $constraint)
    {
        // Validasi request sesuai struktur payload dari frontend
        $request->validate([
            'permintaantahapan_id' => 'required|exists:permintaantahapans,id',
            'type' => 'required|in:schedule,upload_file,text,progress',
            'name' => 'required|string|max:255',
            'detail.required' => 'required|boolean',
            'detail.target_table' => 'required|string',
            'detail.target_column' => 'required_if:type,schedule,text|string|nullable',
            'detail.target_columns' => 'required_if:type,progress|array|nullable',
            'detail.dokumenkategori_id' => 'nullable|exists:dokumenkategoris,id',
            'detail.relasi' => 'nullable|string',
            'detail.isTesting' => 'nullable|boolean',
            'detail.testingtype' => 'nullable|in:Fungsi,Keamanan,Performa',
            'detail.is_domain' => 'nullable|boolean',
            'detail.domain_type' => 'required_if:detail.is_domain,true|in:sementara,live|nullable',
        ]);

        $detail = [
            'name' => $request->name,
            'required' => $request->input('detail.required'),
            'target_table' => $request->input('detail.target_table'),
        ];

        if ($request->type === 'progress') {
            $detail['target_columns'] = $request->input('detail.target_columns', ['description', 'percentage_change']);
        } else {
            $detail['target_column'] = $request->input('detail.target_column');
        }

        if ($request->type === 'text' && $request->input('detail.is_domain')) {
            $detail['is_domain'] = $request->input('detail.is_domain');
            $detail['domain_type'] = $request->input('detail.domain_type');
        }

        if ($request->type === 'upload_file') {
            $detail['dokumenkategori_id'] = $request->input('detail.dokumenkategori_id');
            $detail['isTesting'] = $request->input('detail.isTesting', false);
            $relasi = $request->input('detail.relasi');
            if ($relasi) {
                $detail['relasi'] = 'App\\Models\\' . ucfirst($relasi);
            } else {
                $detail['relasi'] = null;
            }
            if ($request->input('detail.isTesting') && $request->input('detail.testingtype')) {
                $detail['testingtype'] = $request->input('detail.testingtype');
            } else {
                unset($detail['testingtype']);
            }
        } else {
            $detail['dokumenkategori_id'] = null;
            $detail['relasi'] = null;
            if ($request->type !== 'text') {
                unset($detail['is_domain'], $detail['domain_type']);
            }
        }

        $constraint->update([
            'permintaantahapan_id' => $request->permintaantahapan_id,
            'name' => $request->name,
            'type' => $request->type,
            'detail' => $detail,
        ]);

        return response()->json([
            'message' => 'Constraint berhasil diperbarui',
            'constraint' => $constraint->fresh('permintaantahapan'),
        ], 200); // Ubah ke 200 untuk update
    }

    public function destroy(TahapanConstrain $constraint)
    {
        $constraint->delete();

        return response()->json([
            'message' => 'Constraint berhasil dihapus',
        ], 200);
    }
}
