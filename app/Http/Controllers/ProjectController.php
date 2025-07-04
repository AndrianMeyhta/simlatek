<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Project;
use App\Models\Dokumen;
use App\Models\DokumenRelasi;
use App\Models\Testing;
use App\Models\Domainlink;
use App\Models\RbieExtraction;
use App\Models\User;
use App\Models\Permintaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::all()->map(function ($project) {
            $pengelola = User::find($project->dikelola);
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'dikelola' => $pengelola ? $pengelola->name : 'Tidak diketahui',
                'created_at' => $project->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('Project/index', [
            'projects' => $projects,
        ]);
    }

    public function show(Project $project)
    {
        $currentUser = Auth::user();

        $project->load(['testings', 'domainlinks']);

        // Dokumen terkait Project dengan nama kategori
        $dokumens = DB::table('dokumenrelasis')
            ->join('dokumens', 'dokumenrelasis.dokumen_id', '=', 'dokumens.id')
            ->join('dokumenkategoris', 'dokumens.dokumenkategori_id', '=', 'dokumenkategoris.id')
            ->where('dokumenrelasis.relasi_type', Project::class)
            ->where('dokumenrelasis.relasi_id', $project->id)
            ->select(
                'dokumens.id',
                'dokumens.filename',
                'dokumens.filepath',
                'dokumens.dokumenkategori_id',
                'dokumenkategoris.name as dokumenkategori_name'
            )
            ->get();

        // SKPL Data (RbieExtraction terkait Permintaan dari Project)
        $permintaan = $project->permintaan;
        $skplData = $permintaan
            ? RbieExtraction::where('permintaan_id', $permintaan->id)
                ->get()
                ->map(function ($extraction) {
                    return [
                        'id' => $extraction->id,
                        'extracted_data' => json_decode($extraction->extracted_data, true) ?? [],
                        'created_at' => $extraction->created_at->format('Y-m-d H:i:s'),
                    ];
                })->toArray()
            : [];

        // Pengelola saat ini
        $pengelola = User::find($project->dikelola);

        // Daftar pengguna yang tersedia untuk pengelola (hanya untuk superadmin)
        $canEditPengelola = $currentUser->role_id === 5;
        $availableUsers = [];
        if ($canEditPengelola) {
            $availableUsers = User::where('id', '!=', $project->dikelola)
                ->with('skills')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => (string) $user->id, // Cast to string
                        'name' => $user->name,
                        'skills' => $user->skills->map(function ($skill) {
                            return [
                                'name' => $skill->name,
                                'category' => $skill->pivot->category,
                            ];
                        })->toArray(),
                    ];
                })->toArray();
        }

        return Inertia::render('Project/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'dikelola' => [
                    'id' => $pengelola ? (string) $pengelola->id : null,
                    'name' => $pengelola ? $pengelola->name : 'Tidak diketahui',
                ],
                'created_at' => $project->created_at->format('Y-m-d'),
            ],
            'dokumens' => $dokumens,
            'testings' => $project->testings->map(function ($testing) {
                return [
                    'id' => $testing->id,
                    'testingtype' => $testing->testingtype,
                    'status' => $testing->status,
                    'created_at' => $testing->created_at->format('Y-m-d H:i:s'),
                ];
            }),
            'skplData' => $skplData,
            'domainlinks' => $project->domainlinks->map(function ($domain) {
                return [
                    'id' => $domain->id,
                    'links' => $domain->links,
                    'typedomain' => $domain->typedomain,
                ];
            }),
            'canEditPengelola' => $canEditPengelola,
            'availableUsers' => $availableUsers,
        ]);
    }

    public function updatePengelola(Request $request, Project $project)
    {
        $currentUser = Auth::user();
        if ($currentUser->role_id !== 5) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit pengelola'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $oldPengelolaId = $project->dikelola;
        $oldPengelola = User::find($oldPengelolaId);
        $newPengelola = User::findOrFail($request->user_id);
        $project->update(['dikelola' => $newPengelola->id]);

        Log::info('Pengelola proyek diubah', [
            'project_id' => $project->id,
            'old_pengelola' => $oldPengelola ? $oldPengelola->name : 'Unknown',
            'new_pengelola' => $newPengelola->name,
            'user_id' => $currentUser->id,
        ]);

        return response()->json([
            'message' => 'Pengelola berhasil diperbarui',
            'dikelola' => [
                'id' => (string) $newPengelola->id,
                'name' => $newPengelola->name,
            ],
        ]);
    }
}
