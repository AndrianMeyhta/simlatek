<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Permission::with(['role', 'tahapan'])->get()]);
    }

    public function batchUpdate(Request $request)
    {
        $permissions = $request->input('permissions', []);

        // Validasi input (opsional, tapi disarankan)
        if (!is_array($permissions)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data permissions harus berupa array'
            ], 400);
        }

        // Begin transaction
        DB::beginTransaction();

        try {
            foreach ($permissions as $roleId => $tahapanIds) {
                // Pastikan $tahapanIds adalah array
                if (!is_array($tahapanIds)) {
                    continue; // Lewati jika format salah
                }

                // Delete existing permissions for this role
                Permission::where('role_id', $roleId)->delete();

                // Insert new permissions
                foreach ($tahapanIds as $tahapanId) {
                    Permission::create([
                        'role_id' => $roleId,
                        'projecttahapan_id' => $tahapanId
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data berhasil di-update!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memproses permintaan: ' . $e->getMessage()
            ], 500);
        }
    }
}
