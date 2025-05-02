<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Permintaan;
use App\Models\Project;
use App\Models\permintaanprogress;
use App\Models\Progressreport;
use App\Models\Dokumen;
use App\Models\Managing;
use App\Models\DokumenRelasi;
use App\Models\permintaantahapan;
use App\Models\logaktivitas;
use App\Models\tahapanconstrain;
use App\Models\Rapat;
use App\Models\User;
use App\Models\Rekomendasi;
use App\Models\Constraindata;
use App\Models\RbieRule;
use App\Models\RbieExtraction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;
use App\Events\PermintaanUpdated;
use App\Events\NotificationCreated;
use App\Models\Notifications;

class PermintaanController extends Controller
{
    public function index()
    {
        // Ambil semua permintaan beserta relasi progress
        $permintaans = Permintaan::with('progress')->get();

        // Hitung progress pengerjaan untuk setiap permintaan
        $permintaans = $permintaans->map(function ($permintaan) {
            // Pastikan relasi progress ada
            $progressData = $permintaan->progress ?? collect(); // Default ke koleksi kosong jika null
            $totalTahapan = $progressData->count();
            $tahapanSelesai = $progressData->where('status', 'completed')->count();
            $progress = $totalTahapan > 0 ? round(($tahapanSelesai / $totalTahapan) * 100, 2) : 0;
            $permintaan->progress = $progress;
            return $permintaan;
        })->values(); // Reset indeks array

        return Inertia::render('Permintaan/index', [
            'permintaans' => $permintaans->map(function ($permintaan) {
                return [
                    'id' => $permintaan->id,
                    'nomertiket' => $permintaan->nomertiket,
                    'title' => $permintaan->title,
                    'status' => $permintaan->status,
                    'progress' => $permintaan->progress,
                ];
            }),
        ]);
    }

    public function create()
    {
        // Generate nomertiket untuk ditampilkan di form
        $today = now()->format('Ymd');
        $count = Permintaan::whereDate('created_at', now()->toDateString())->count() + 1;
        $nomertiket = $today . str_pad($count, 3, '0', STR_PAD_LEFT);

        return Inertia::render('Permintaan/create', [
            'nomertiket' => $nomertiket,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'anggaran' => 'required|string',
            'suratPermohonan' => 'required|file|max:10240',
            'dataUsulan' => 'required|file|max:10240',
            'petaPerencanaan' => 'required|file|max:10240',
        ]);

        $today = now()->format('Ymd');
        $count = Permintaan::whereDate('created_at', now()->toDateString())->count() + 1;
        $nomertiket = $today . str_pad($count, 3, '0', STR_PAD_LEFT);

        $permintaan = Permintaan::create([
            'user_id' => Auth::user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'New',
            'nomertiket' => $nomertiket,
            'anggaran' => $request->anggaran,
        ]);

        $dokumenCategories = [
            'suratPermohonan' => 1,
            'dataUsulan' => 2,
            'petaPerencanaan' => 3,
        ];

        foreach ($dokumenCategories as $key => $categoryId) {
            $file = $request->file($key);
            $filepath = $file->store('dokumen', 'public');

            $dokumen = Dokumen::create([
                'filename' => $file->getClientOriginalName(),
                'filepath' => $filepath,
                'dokumenkategori_id' => $categoryId,
            ]);

            DokumenRelasi::create([
                'dokumen_id' => $dokumen->id,
                'relasi_type' => Permintaan::class,
                'relasi_id' => $permintaan->id,
            ]);
        }

        $project = Project::create([
            'name' => $request->title,
            'description' => $request->description,
            'permintaan_id' => $permintaan->id,
            'dikelola' => 1,
        ]);

        $currentUser = Auth::user();
        $superadminId = 1;

        if ($currentUser->id !== $superadminId) {
            Managing::create([
                'user_id' => $currentUser->id,
                'permintaan_id' => $permintaan->id,
                'role' => 'creator',
            ]);
            Managing::create([
                'user_id' => $superadminId,
                'permintaan_id' => $permintaan->id,
                'role' => 'superadmin',
            ]);
        } else {
            Managing::create([
                'user_id' => $superadminId,
                'permintaan_id' => $permintaan->id,
                'role' => 'superadmin',
            ]);
        }

        permintaanprogress::create([
            'permintaan_id' => $permintaan->id,
            'permintaantahapan_id' => 1,
            'percentage' => 100,
            'status' => 'completed',
            'description' => 'User membuat permintaan',
        ]);

        $tahapan = permintaantahapan::orderBy('id')->get();
        $stepCounter = 0;

        foreach ($tahapan as $step) {
            $existingProgress = $permintaan->progress->firstWhere('permintaantahapan_id', $step->id);
            $stepCounter++;
            if (!$existingProgress) {
                permintaanprogress::create([
                    'permintaan_id' => $permintaan->id,
                    'permintaantahapan_id' => $step->id,
                    'percentage' => 0,
                    'status' => ($stepCounter == 2) ? 'current' : 'upcoming',
                    'description' => ($stepCounter == 2) ? 'Tahapan sedang berjalan' : 'Tahapan belum dimulai',
                ]);
            }
        }

        // Return JSON with permintaan_id
        return response()->json([
            'message' => 'Permintaan berhasil dibuat',
            'permintaan_id' => $permintaan->id,
        ], 201);
    }

    public function show(Permintaan $permintaan)
    {
        $currentUser = Auth::user();
        $isInvolved = Managing::where('permintaan_id', $permintaan->id)
            ->where('user_id', $currentUser->id)
            ->exists();

        if (!$isInvolved) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke permintaan ini'], 403);
        }

        $currentPermintaanId = $permintaan->id;

        $permintaan->load([
            'progress' => function ($query) use ($currentPermintaanId) {
                $query->with([
                    'tahapan' => fn($q) => $q->withDefault(['name' => 'Tahapan Tidak Diketahui']),
                    'tahapanconstrains' => fn($q) => $q->with([
                        'constraindata' => fn($q) => $q->where('permintaan_id', $currentPermintaanId),
                    ]),
                ]);
            },
            'project.dikelola',
            'users',
        ]);

        // Dokumen awal (terkait Permintaan)
        $permintaanDokumens = DB::table('dokumenrelasis')
            ->join('dokumens', 'dokumenrelasis.dokumen_id', '=', 'dokumens.id')
            ->where('dokumenrelasis.relasi_type', 'App\Models\Permintaan')
            ->where('dokumenrelasis.relasi_id', $permintaan->id)
            ->select('dokumens.id', 'dokumens.filename', 'dokumens.filepath', 'dokumens.dokumenkategori_id')
            ->get();

        // Isi target_data untuk constrain
        foreach ($permintaan->progress as $progress) {
            foreach ($progress->tahapanconstrains as $constrain) {
                $detail = $constrain->detail;
                if (isset($detail['target_table']) && isset($detail['target_column'])) {
                    if ($detail['target_table'] === 'dokumens') {
                        $constrain->target_data = DB::table('dokumenrelasis')
                            ->join('dokumens', 'dokumenrelasis.dokumen_id', '=', 'dokumens.id')
                            ->where('dokumenrelasis.relasi_type', 'App\Models\Permintaanprogress')
                            ->where('dokumenrelasis.relasi_id', $progress->id)
                            ->where('dokumens.dokumenkategori_id', $detail['dokumenkategori_id'] ?? null)
                            ->select('dokumens.filename', 'dokumens.filepath')
                            ->first();
                    } elseif ($detail['target_table'] === 'rapats') {
                        $constrain->target_data = DB::table('rapats')
                            ->where('permintaan_id', $currentPermintaanId)
                            ->select('jadwalrapat')
                            ->first();
                    } elseif ($detail['target_table'] === 'constraindatas') {
                        $constrain->target_data = $constrain->constraindata;
                    }
                }
            }
        }

        if (isset($detail['is_domain']) && $detail['is_domain'] && $permintaan->project) {
            $constrain->target_data = DB::table('domainlinks')
                ->where('project_id', $permintaan->project->id)
                ->where('typedomain', $detail['domain_type'] ?? 'sementara')
                ->select('links', 'typedomain')
                ->first();
        }

        $logAktivitas = Logaktivitas::whereIn('permintaanprogress_id', $permintaan->progress->pluck('id'))
            ->with('users')
            ->orderBy('created_at', 'desc')
            ->get();

        $userPermissions = $currentUser->role->permissions->pluck('permintaantahapan_id')->toArray();

        // Logika untuk tombol "Tambah User" dan daftar user yang bisa ditambahkan
        $canAddUsers = false;
        $availableUsers = [];

        if ($currentUser->role_id === 5) { // Superadmin
            $canAddUsers = true;
            $availableUsers = User::with(['skills' => function ($query) {
                $query->withPivot('id', 'level', 'experience_since', 'notes');
            }])
                ->whereNotIn('id', Managing::where('permintaan_id', $permintaan->id)->pluck('user_id'))
                ->get()
                ->map(function ($user) {
                    // Hitung jumlah aplikasi dari managing
                    $applicationCount = Managing::where('user_id', $user->id)->count();

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role_id' => $user->role_id,
                        'application_count' => $applicationCount, // Tambahkan jumlah aplikasi
                        'skills' => $user->skills->map(fn($skill) => [
                            'id' => $skill->id,
                            'name' => $skill->name,
                            'category' => $skill->category,
                            'pivot' => [
                                'level' => $skill->pivot->level,
                                'experience_since' => $skill->pivot->experience_since,
                                'notes' => $skill->pivot->notes,
                            ],
                        ]),
                    ];
                });
        } elseif ($currentUser->role_id !== 1) {
            $canAddUsers = true;
            $availableUsers = User::with(['skills' => function ($query) {
                $query->withPivot('id', 'level', 'experience_since', 'notes');
            }])
                ->where('role_id', $currentUser->role_id)
                ->whereNotIn('id', Managing::where('permintaan_id', $permintaan->id)->pluck('user_id'))
                ->get()
                ->map(function ($user) {
                    // Hitung jumlah aplikasi dari managing
                    $applicationCount = Managing::where('user_id', $user->id)->count();

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role_id' => $user->role_id,
                        'application_count' => $applicationCount, // Tambahkan jumlah aplikasi
                        'skills' => $user->skills->map(fn($skill) => [
                            'id' => $skill->id,
                            'name' => $skill->name,
                            'category' => $skill->category,
                            'pivot' => [
                                'level' => $skill->pivot->level,
                                'experience_since' => $skill->pivot->experience_since,
                                'notes' => $skill->pivot->notes,
                            ],
                        ]),
                    ];
                });
        }

        $rekomendasi = Rekomendasi::where('permintaan_id', $permintaan->id)->first();

        foreach ($permintaan->progress as $progress) {
            foreach ($progress->tahapanconstrains as $constrain) {
                $constrain->hasRbieRule = RbieRule::where('tahapanconstrain_id', $constrain->id)->exists();
            }
        }

        return Inertia::render('Permintaan/show', [
            'permintaan' => $permintaan,
            'project' => $permintaan->project,
            'permintaanprogresses' => $permintaan->progress,
            'logAktivitas' => $logAktivitas,
            'userPermissions' => $userPermissions,
            'permintaanDokumens' => $permintaanDokumens,
            'canAddUsers' => $canAddUsers,
            'availableUsers' => $availableUsers,
            'rekomendasi' => $rekomendasi ? [
                'id' => $rekomendasi->id,
                'status' => $rekomendasi->status,
                'created_at' => $rekomendasi->created_at,
            ] : null,
            'role_id' => $currentUser->role_id,
        ]);
    }

    public function updateConstrain(Request $request, $permintaanId, $constrainId)
    {
        try {
            $constrain = TahapanConstrain::findOrFail($constrainId);
            $detail = $constrain->detail;

            // Aturan validasi dasar
            $rules = [
                'constrain_type' => 'required|in:upload_file,schedule,text,progress',
                'file' => 'required_if:constrain_type,upload_file|file|max:10240',
                'value' => 'required_if:constrain_type,schedule,text',
                'description' => 'required_if:constrain_type,progress|string',
                'percentage_change' => 'required_if:constrain_type,progress|numeric|min:0|max:100',
                'permintaan_id' => 'required|exists:permintaans,id',
            ];

            if (($detail['is_domain'] ?? false) && $request->constrain_type === 'text') {
                if (empty($detail['domain_type'])) {
                    return response()->json(['message' => 'Domain type tidak ditemukan di detail constrain'], 422);
                }
            }

            $request->validate($rules);

            $progress = Permintaanprogress::where('permintaan_id', $permintaanId)
                ->where('permintaantahapan_id', $constrain->permintaantahapan_id)
                ->firstOrFail();

            if ($progress->permintaan_id != $permintaanId) {
                return response()->json(['message' => 'Permintaan tidak cocok'], 403);
            }

            $permintaan = Permintaan::with('project')->findOrFail($permintaanId);

            $constraindata = Constraindata::firstOrCreate(
                ['permintaan_id' => $progress->permintaan_id, 'tahapanconstrain_id' => $constrain->id],
                ['status' => 'pending']
            );

            if (empty($detail) || !isset($detail['target_table'])) {
                return response()->json(['message' => 'Detail constrain tidak lengkap'], 422);
            }

            $target_data = null;

            if ($request->constrain_type === 'upload_file') {
                $file = $request->file('file');
                $path = $file->store('dokumen', 'public');
                $dokumenData = [
                    'filename' => $file->getClientOriginalName(),
                    'filepath' => $path,
                    'dokumenkategori_id' => $detail['dokumenkategori_id'] ?? 1,
                ];
                $dokumenId = DB::table('dokumens')->insertGetId($dokumenData);

                // Relasi wajib ke Permintaanprogress
                DB::table('dokumenrelasis')->insert([
                    'dokumen_id' => $dokumenId,
                    'relasi_type' => 'App\Models\Permintaanprogress',
                    'relasi_id' => $progress->id,
                ]);

                // Relasi opsional berdasarkan detail['relasi']
                if (isset($detail['relasi'])) {
                    $relasiType = $detail['relasi'];
                    $relasiId = $this->resolveRelasiId($relasiType, $permintaanId, $detail);
                    if ($relasiId) {
                        DB::table('dokumenrelasis')->insert([
                            'dokumen_id' => $dokumenId,
                            'relasi_type' => $relasiType,
                            'relasi_id' => $relasiId,
                        ]);
                    }
                }

                $rbieRule = RbieRule::where('tahapanconstrain_id', $constrain->id)->first();
                if ($rbieRule) {
                    try {
                        $extractedData = $this->applyRbieRules($file, $rbieRule->matching_rules, $rbieRule->preprocessing ?? []);

                        // Cek apakah sudah ada data RbieExtraction
                        $existingExtraction = RbieExtraction::where('permintaan_id', $permintaanId)
                            ->where('tahapanconstrain_id', $constrain->id)
                            ->first();

                        if ($existingExtraction) {
                            \Log::info("Menghapus RbieExtraction lama", [
                                'permintaan_id' => $permintaanId,
                                'tahapanconstrain_id' => $constrain->id,
                                'old_data' => $existingExtraction->toArray()
                            ]);
                            $existingExtraction->delete();
                        }

                        // Simpan data baru ke tabel rbie_extractions
                        $rbieExtraction = RbieExtraction::create([
                            'permintaan_id' => $permintaanId,
                            'tahapanconstrain_id' => $constrain->id,
                            'extracted_data' => json_encode($extractedData),
                        ]);

                        \Log::info("RbieExtraction baru disimpan", [
                            'permintaan_id' => $permintaanId,
                            'tahapanconstrain_id' => $constrain->id,
                            'extracted_data' => $extractedData,
                            'rbie_id' => $rbieExtraction->id
                        ]);

                        // Relasi wajib ke Permintaanprogress untuk RbieExtraction
                        DB::table('dokumenrelasis')->insert([
                            'dokumen_id' => $dokumenId,
                            'relasi_type' => 'App\Models\Permintaanprogress',
                            'relasi_id' => $progress->id,
                        ]);

                        // Relasi opsional untuk RbieExtraction
                        if (isset($detail['relasi'])) {
                            $relasiType = $detail['relasi'];
                            $relasiId = $this->resolveRelasiId($relasiType, $permintaanId, $detail);
                            if ($relasiId) {
                                DB::table('dokumenrelasis')->insert([
                                    'dokumen_id' => $dokumenId,
                                    'relasi_type' => $relasiType,
                                    'relasi_id' => $relasiId,
                                ]);
                            }
                        }

                        $target_data['extracted_data'] = $extractedData;
                    } catch (\Exception $e) {
                        \Log::error("Gagal menerapkan RbieRule", [
                            'permintaan_id' => $permintaanId,
                            'tahapanconstrain_id' => $constrain->id,
                            'error' => $e->getMessage(),
                        ]);
                        $target_data['extracted_data'] = [];
                    }
                }

                $constraindata->update(['status' => 'fulfilled']);
                $target_data = array_merge($dokumenData, $target_data ?? []);
            } elseif ($request->constrain_type === 'progress') {
                $description = $request->input('description');
                $percentageChange = (int) $request->input('percentage_change');
                $currentPercentage = $progress->percentage ?? 0;
                $newPercentage = min(100, $currentPercentage + $percentageChange);

                $progressReport = Progressreport::create([
                    'permintaanprogress_id' => $progress->id,
                    'description' => $description,
                    'percentage_change' => $percentageChange,
                ]);

                $progress->update(['percentage' => $newPercentage]);
                $constraindata->update(['status' => 'fulfilled']);
                $target_data = ['percentage' => $newPercentage];
            } elseif (in_array($request->constrain_type, ['schedule', 'text'])) {
                $value = $request->input('value');
                $data = [
                    'permintaan_id' => $permintaanId,
                ];

                if ($request->constrain_type === 'text' && ($detail['is_domain'] ?? false)) {
                    if (!$permintaan->project) {
                        return response()->json(['message' => 'Project tidak ditemukan untuk permintaan ini'], 422);
                    }

                    $projectId = $permintaan->project->id;
                    $domainType = $detail['domain_type'];

                    $existingDomains = DB::table('domainlinks')
                        ->where('project_id', $projectId)
                        ->count();

                    $existingDomain = DB::table('domainlinks')
                        ->where('project_id', $projectId)
                        ->where('typedomain', $domainType)
                        ->first();

                    if ($existingDomain) {
                        DB::table('domainlinks')
                            ->where('project_id', $projectId)
                            ->where('typedomain', $domainType)
                            ->update([
                                'links' => $value,
                                'updated_at' => now(),
                            ]);
                        $target_data = [
                            'project_id' => $projectId,
                            'links' => $value,
                            'typedomain' => $domainType,
                        ];
                    } else {
                        if ($existingDomains >= 2) {
                            return response()->json([
                                'message' => 'Project ini sudah memiliki 2 domain (sementara dan live), tidak bisa menambah lagi'
                            ], 422);
                        }

                        $data = [
                            'project_id' => $projectId,
                            'links' => $value,
                            'typedomain' => $domainType,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                        DB::table('domainlinks')->insert($data);
                        $target_data = $data;
                    }
                } else {
                    $data[$detail['target_column']] = $value;
                    DB::table($detail['target_table'])->insert($data);
                    $target_data = $data;
                }

                $constraindata->update(['status' => 'fulfilled']);
            }

            Logaktivitas::create([
                'permintaanprogress_id' => $progress->id,
                'user_id' => Auth::id(),
                'action' => 'Update',
                'description' => "Update constrain: {$request->constrain_type}",
            ]);

            // Kirim event real-time
            $eventData = [
                'constrain_id' => $constrain->id,
                'progress_id' => $progress->id,
                'percentage' => $progress->percentage,
                'status' => $constraindata->status,
                'target_data' => $target_data,
            ];
            event(new PermintaanUpdated($permintaan, 'update_constrain', $eventData));

            return response()->json([
                'message' => 'Constrain berhasil diperbarui',
                'target_data' => $target_data,
                'constrain' => [
                    'id' => $constrain->id,
                    'status' => $constraindata->status,
                ],
                'progress' => [
                    'id' => $progress->id,
                    'percentage' => $progress->percentage,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error("Gagal memperbarui constrain", [
                'permintaan_id' => $permintaanId,
                'constrain_id' => $constrainId,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Gagal memperbarui constrain: ' . $e->getMessage()], 500);
        }
    }

    private function applyRbieRules($file, $matchingRules, $preprocessing)
    {
        $filePath = $file->getRealPath();

        // Gunakan Smalot buat parsing PDF
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);
        $text = $pdf->getText();

        // Preprocessing
        foreach ($preprocessing as $step) {
            if ($step['type'] === 'replace') {
                $text = preg_replace("/{$step['pattern']}/", $step['replacement'], $text);
            }
        }

        $splitPattern = $preprocessing[array_search('split', array_column($preprocessing, 'type'))]['pattern'] ?? '(?<=[.!?:])\s+';
        $sentences = preg_split("/{$splitPattern}/", $text);

        // Rule Matching
        $extracted = [];
        foreach ($sentences as $sentence) {
            foreach ($matchingRules as $rule) {
                if (preg_match("/{$rule['pattern']}/u", $sentence)) {
                    $cleaned = preg_replace('/^(?:\d+\.)?\s*(?:SRS-F-[^\s]+\s+)?/i', '', $sentence);
                    $cleaned = rtrim($cleaned, '.') . '.';
                    $extracted[] = $cleaned;
                }
            }
        }

        return $extracted;
    }

    private function resolveRelasiId($relasiType, $permintaanId, $detail)
    {
        switch ($relasiType) {
            case 'App\Models\Rapat':
                $rapat = Rapat::where('permintaan_id', $permintaanId)->first();
                return $rapat ? $rapat->id : null;
            case 'App\Models\Project':
                $project = Project::where('permintaan_id', $permintaanId)->first();
                return $project ? $project->id : null;
            case 'App\Models\RbieExtraction':
                $rbieExtraction = RbieExtraction::where('permintaan_id', $permintaanId)
                    ->where('tahapanconstrain_id', $detail['tahapanconstrain_id'] ?? null)
                    ->first();
                return $rbieExtraction ? $rbieExtraction->id : null;
            default:
                return null;
        }
    }

    public function confirmConstrain(Request $request, $permintaanId, $constrainId)
    {
        $constraindata = Constraindata::where('tahapanconstrain_id', $constrainId)
            ->where('permintaan_id', $permintaanId)
            ->firstOrFail();

        $constraindata->update(['status' => 'confirmed']);
        return response()->json(['message' => 'Constrain berhasil dikonfirmasi']);
    }

    public function confirmStep(Request $request, $permintaanId)
    {
        try {
            $request->validate([
                'permintaanprogressId' => 'required|exists:permintaanprogresses,id',
                'permintaan_id' => 'required|exists:permintaans,id',
            ]);

            return DB::transaction(function () use ($request, $permintaanId) {
                $progress = Permintaanprogress::where('id', $request->permintaanprogressId)
                    ->where('permintaan_id', $permintaanId)
                    ->with(['tahapanconstrains.constraindata', 'tahapan', 'permintaan'])
                    ->firstOrFail();

                $hasUploadFile = $progress->tahapanconstrains->some(fn($c) => $c->type === 'upload_file');
                $hasProgress = $progress->tahapanconstrains->some(fn($c) => $c->type === 'progress');

                if ($hasUploadFile) {
                    $allUploadFilesFulfilled = $progress->tahapanconstrains
                        ->filter(fn($c) => $c->type === 'upload_file')
                        ->every(fn($c) => $c->constraindata?->status === 'fulfilled');
                    if (!$allUploadFilesFulfilled) {
                        throw new \Exception('Semua constrain upload_file harus terpenuhi terlebih dahulu.');
                    }
                }

                if ($hasProgress && $progress->percentage < 100) {
                    throw new \Exception('Persentase progress harus mencapai 100%.');
                }

                $progress->update([
                    'status' => 'completed',
                    'percentage' => 100,
                    'description' => 'Tahapan telah selesai',
                    'updated_at' => now(),
                ]);

                $nextProgress = Permintaanprogress::where('permintaan_id', $progress->permintaan_id)
                    ->where('id', '>', $progress->id)
                    ->orderBy('id', 'asc')
                    ->with('tahapan')
                    ->first();

                if ($nextProgress) {
                    $nextProgress->update([
                        'status' => 'current',
                        'description' => 'Tahapan sedang berjalan',
                        'updated_at' => now(),
                    ]);

                    $tahapanConstrains = TahapanConstrain::where('permintaantahapan_id', $nextProgress->permintaantahapan_id)->get();
                    foreach ($tahapanConstrains as $constrain) {
                        Constraindata::firstOrCreate(
                            ['permintaan_id' => $nextProgress->permintaan_id, 'tahapanconstrain_id' => $constrain->id],
                            ['status' => 'pending', 'created_at' => now()]
                        );
                    }

                    // Get roles with permissions for the next tahapan
                    $roleIds = DB::table('permissions')
                        ->where('permintaantahapan_id', $nextProgress->permintaantahapan_id)
                        ->pluck('role_id')
                        ->toArray();

                    // Get users who have these roles and are involved in the permintaan
                    $usersToNotify = User::whereIn('role_id', $roleIds)
                        ->whereIn('id', Managing::where('permintaan_id', $permintaanId)->pluck('user_id'))
                        ->get();

                    // Create notifications for each user
                    foreach ($usersToNotify as $user) {
                        $notification = Notifications::create([
                            'user_id' => $user->id,
                            'permintaan_id' => $permintaanId,
                            'type' => 'task_assigned',
                            'message' => "Tahapan '{$nextProgress->tahapan?->name}' telah dimulai untuk permintaan '{$progress->permintaan->title}'. Silakan penuhi persyaratan tahapan.",
                            'data' => [
                                'permintaan_id' => $permintaanId,
                                'progress_id' => $nextProgress->id,
                                'tahapan_id' => $nextProgress->permintaantahapan_id,
                                'tahapan_name' => $nextProgress->tahapan?->name ?? 'Tidak Diketahui',
                            ],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        event(new NotificationCreated($notification));
                    }

                    // Log activity for starting the next tahapan
                    Logaktivitas::create([
                        'permintaanprogress_id' => $nextProgress->id,
                        'user_id' => Auth::id(),
                        'action' => 'Start Step',
                        'description' => 'Tahapan ' . ($nextProgress->tahapan?->name ?? 'Tidak Diketahui') . ' mulai berjalan',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Log activity for confirming current tahapan
                Logaktivitas::create([
                    'permintaanprogress_id' => $progress->id,
                    'user_id' => Auth::id(),
                    'action' => 'Confirm Step',
                    'description' => 'Tahapan ' . ($progress->tahapan?->name ?? 'Tidak Diketahui') . ' dikonfirmasi dan selesai',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Notify users involved in the current permintaan about step completion
                $involvedUsers = Managing::where('permintaan_id', $permintaanId)
                    ->where('user_id', '!=', Auth::id())
                    ->pluck('user_id');

                foreach ($involvedUsers as $userId) {
                    $notification = Notifications::create([
                        'user_id' => $userId,
                        'permintaan_id' => $permintaanId,
                        'type' => 'step_confirmed',
                        'message' => "Tahapan '{$progress->tahapan?->name}' telah selesai untuk permintaan '{$progress->permintaan->title}'",
                        'data' => [
                            'permintaan_id' => $permintaanId,
                            'progress_id' => $progress->id,
                            'tahapan_id' => $progress->permintaantahapan_id,
                            'tahapan_name' => $progress->tahapan?->name ?? 'Tidak Diketahui',
                        ],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    event(new NotificationCreated($notification));
                }

                // Broadcast PermintaanUpdated event
                $permintaan = Permintaan::findOrFail($permintaanId);
                $eventData = [
                    'progress_id' => $progress->id,
                    'next_progress_id' => $nextProgress ? $nextProgress->id : null,
                    'percentage' => $progress->percentage,
                    'status' => $progress->status,
                ];
                event(new PermintaanUpdated($permintaan, 'confirm_step', $eventData));

                return response()->json([
                    'message' => 'Tahapan berhasil dikonfirmasi',
                    'current_progress' => $progress->toArray(),
                    'next_progress' => $nextProgress ? $nextProgress->toArray() : null,
                ]);
            });
        } catch (\Exception $e) {
            Log::error("Gagal mengonfirmasi tahapan", [
                'permintaan_id' => $permintaanId,
                'progress_id' => $request->permintaanprogressId,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Gagal mengonfirmasi tahapan: ' . $e->getMessage()], 500);
        }
    }

    public function updateConstrainWithFile(Request $request, $permintaanId, $constrainId)
    {
        try {
            $request->validate([
                'description' => 'required|string|max:1000',
                'percentage_change' => 'required|numeric|min:0|max:100',
                'file' => 'required|file|max:10240|mimes:pdf,doc,docx',
                'permintaan_id' => 'required|exists:permintaans,id',
            ]);

            return DB::transaction(function () use ($request, $permintaanId, $constrainId) {
                $progressConstrain = TahapanConstrain::findOrFail($constrainId);
                $progress = Permintaanprogress::where('permintaan_id', $permintaanId)
                    ->where('permintaantahapan_id', $progressConstrain->permintaantahapan_id)
                    ->with(['permintaan.project'])
                    ->firstOrFail();

                if ($progress->permintaan_id != $permintaanId) {
                    throw new \Exception('Permintaan tidak cocok');
                }

                $uploadFileConstrain = TahapanConstrain::where('permintaantahapan_id', $progressConstrain->permintaantahapan_id)
                    ->where('type', 'upload_file')
                    ->firstOrFail();

                // Handle file upload
                $file = $request->file('file');
                $path = $file->store('dokumen', 'public');
                $dokumenData = [
                    'filename' => $file->getClientOriginalName(),
                    'filepath' => $path,
                    'dokumenkategori_id' => $uploadFileConstrain->detail['dokumenkategori_id'] ?? 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $dokumenId = DB::table('dokumens')->insertGetId($dokumenData);

                // Handle progress update
                $description = $request->input('description');
                $percentageChange = (int) $request->input('percentage_change');
                $currentPercentage = $progress->percentage ?? 0;
                $newPercentage = min(100, $currentPercentage + $percentageChange);

                $progressReport = Progressreport::create([
                    'permintaanprogress_id' => $progress->id,
                    'description' => $description,
                    'percentage_change' => $percentageChange,
                    'dokumen_id' => $dokumenId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Create document relations
                $relations = [
                    [
                        'dokumen_id' => $dokumenId,
                        'relasi_type' => 'App\Models\Progressreport',
                        'relasi_id' => $progressReport->id,
                    ],
                    [
                        'dokumen_id' => $dokumenId,
                        'relasi_type' => 'App\Models\Permintaanprogress',
                        'relasi_id' => $progress->id,
                    ],
                ];

                // Optional relation based on detail['relasi']
                $detail = $uploadFileConstrain->detail;
                if (isset($detail['relasi'])) {
                    $relasiId = $this->resolveRelasiId($detail['relasi'], $permintaanId, $detail);
                    if ($relasiId) {
                        $relations[] = [
                            'dokumen_id' => $dokumenId,
                            'relasi_type' => $detail['relasi'],
                            'relasi_id' => $relasiId,
                        ];
                    }
                }
                DB::table('dokumenrelasis')->insert($relations);

                // Handle testing if applicable
                $isTesting = $detail['isTesting'] ?? false;
                $testingStatus = null;
                if ($isTesting) {
                    $testingStatus = $newPercentage >= 100 ? 'Passed' : 'Process';
                    DB::table('testings')->insert([
                        'project_id' => $progress->permintaan->project->id,
                        'progressreport_id' => $progressReport->id,
                        'testingtype' => $detail['testingtype'] ?? 'Fungsi',
                        'status' => $testingStatus,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Update progress and constrain data
                $progress->update([
                    'percentage' => $newPercentage,
                    'updated_at' => now(),
                ]);

                $progressConstrainData = Constraindata::firstOrCreate(
                    ['permintaan_id' => $progress->permintaan_id, 'tahapanconstrain_id' => $progressConstrain->id],
                    ['status' => 'pending', 'created_at' => now()]
                );
                $progressConstrainData->update(['status' => 'fulfilled', 'updated_at' => now()]);

                $uploadFileConstrainData = Constraindata::firstOrCreate(
                    ['permintaan_id' => $progress->permintaan_id, 'tahapanconstrain_id' => $uploadFileConstrain->id],
                    ['status' => 'pending', 'created_at' => now()]
                );
                $uploadFileConstrainData->update(['status' => 'fulfilled', 'updated_at' => now()]);

                // Log activity
                $logDescription = "Update progress dengan file: $description ($percentageChange%)";
                if ($isTesting) {
                    $logDescription .= " - Testing " . ($testingStatus === 'Passed' ? 'Selesai' : 'Dalam Proses');
                }

                Logaktivitas::create([
                    'permintaanprogress_id' => $progress->id,
                    'user_id' => Auth::id(),
                    'action' => 'Update',
                    'description' => $logDescription,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Broadcast PermintaanUpdated event
                $eventData = [
                    'progress_id' => $progress->id,
                    'percentage' => $newPercentage,
                    'constrain_id' => $progressConstrain->id,
                    'target_data' => $dokumenData,
                    'testing_status' => $isTesting ? $testingStatus : null,
                ];
                event(new PermintaanUpdated($progress->permintaan, 'update_constrain_with_file', $eventData));

                // Prepare response
                $responseData = [
                    'message' => 'Progress dan file berhasil diperbarui',
                    'target_data' => $dokumenData,
                    'progress_report' => $progressReport->toArray(),
                    'progress' => [
                        'id' => $progress->id,
                        'percentage' => $newPercentage,
                    ],
                ];

                if ($isTesting) {
                    $responseData['testing'] = [
                        'status' => $testingStatus,
                        'testingtype' => $detail['testingtype'] ?? 'Fungsi',
                    ];
                }

                return response()->json($responseData);
            });
        } catch (\Exception $e) {
            Log::error("Gagal memperbarui progress dengan file", [
                'permintaan_id' => $permintaanId,
                'constrain_id' => $constrainId,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Gagal memperbarui progress: ' . $e->getMessage()], 500);
        }
    }

    public function getProgressReports($permintaanId, $constrainId)
    {
        try {
            $constrain = TahapanConstrain::findOrFail($constrainId);
            $progress = Permintaanprogress::where('permintaan_id', $permintaanId)
                ->where('permintaantahapan_id', $constrain->permintaantahapan_id)
                ->firstOrFail();

            $progressReports = Progressreport::where('permintaanprogress_id', $progress->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $reportsWithFiles = $progressReports->map(function($report) {
                $data = $report->toArray();

                // Ambil dokumen langsung dari dokumen_id di progressreport
                if ($report->dokumen_id) {
                    $dokumen = DB::table('dokumens')->find($report->dokumen_id);
                    if ($dokumen) {
                        $data['file'] = [
                            'filename' => $dokumen->filename,
                            'filepath' => $dokumen->filepath,
                        ];
                    }
                }

                // Ambil dokumen terkait melalui dokumenrelasis
                $relatedDokumens = DB::table('dokumenrelasis')
                    ->where('relasi_type', 'App\Models\Progressreport')
                    ->where('relasi_id', $report->id)
                    ->join('dokumens', 'dokumenrelasis.dokumen_id', '=', 'dokumens.id')
                    ->select('dokumens.filename', 'dokumens.filepath')
                    ->get();

                if ($relatedDokumens->isNotEmpty()) {
                    $data['related_files'] = $relatedDokumens->map(function($dokumen) {
                        return [
                            'filename' => $dokumen->filename,
                            'filepath' => $dokumen->filepath,
                        ];
                    })->toArray();
                }

                return $data;
            });

            return response()->json($reportsWithFiles);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data progress: ' . $e->getMessage()], 500);
        }
    }

    public function inviteUser(Request $request, Permintaan $permintaan)
    {
        $currentUser = Auth::user();

        // Role definitions
        $roles = [
            1 => 'opd',
            2 => 'tki_egov',
            3 => 'tki_aplikasi',
            4 => 'tik',
            5 => 'superadmin',
        ];

        // OPD tidak bisa invite siapapun
        if ($currentUser->role_id === 1) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengundang user'], 403);
        }

        // Validasi input
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userToAdd = User::findOrFail($request->user_id);

        // Superadmin bisa invite semua role
        if ($currentUser->role_id !== 5) {
            // Selain superadmin hanya bisa invite role yang sama
            if ($currentUser->role_id !== $userToAdd->role_id) {
                return response()->json([
                    'message' => "Anda hanya bisa mengundang user dengan role {$roles[$currentUser->role_id]}"
                ], 403);
            }
        }

        // Cek apakah user sudah ada di managings
        $exists = Managing::where('permintaan_id', $permintaan->id)
            ->where('user_id', $userToAdd->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'User sudah terlibat dalam permintaan ini'], 400);
        }

        // Tambahkan user ke managing
        $managing = Managing::create([
            'user_id' => $userToAdd->id,
            'permintaan_id' => $permintaan->id,
            'role' => 'member',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Log aktivitas
        Logaktivitas::create([
            'permintaanprogress_id' => $permintaan->progress->first()->id,
            'user_id' => $currentUser->id,
            'action' => 'Invite User',
            'description' => "Mengundang user: {$userToAdd->name}",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create notification for invited user
        $notification = Notifications::create([
            'user_id' => $userToAdd->id,
            'permintaan_id' => $permintaan->id,
            'type' => 'invite',
            'message' => "Anda telah diundang untuk bergabung dengan permintaan '{$permintaan->title}' oleh {$currentUser->name}",
            'data' => [
                'permintaan_id' => $permintaan->id,
                'invited_by' => $currentUser->id,
                'invited_by_name' => $currentUser->name,
            ],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        event(new NotificationCreated($notification));

        return response()->json(['message' => 'User berhasil diundang']);
    }

    public function updateRekomendasi(Request $request, $permintaanId)
    {
        try {
            // Validasi input
            $request->validate([
                'status' => 'required|in:Approved,Rejected',
                'permintaan_id' => 'required|exists:permintaans,id',
            ]);

            return DB::transaction(function () use ($request, $permintaanId) {
                $permintaan = Permintaan::findOrFail($permintaanId);
                $currentUser = Auth::user();

                // Pastikan user memiliki akses ke permintaan ini
                $isInvolved = Managing::where('permintaan_id', $permintaan->id)
                    ->where('user_id', $currentUser->id)
                    ->exists();

                if (!$isInvolved) {
                    return response()->json(['message' => 'Anda tidak memiliki akses ke permintaan ini'], 403);
                }

                // Simpan data rekomendasi
                $rekomendasi = Rekomendasi::create([
                    'permintaan_id' => $permintaanId,
                    'status' => $request->status,
                ]);

                // Jika status "Rejected", update status permintaan dan tutup semua tahapan
                if ($request->status === 'Rejected') {
                    $permintaan->update(['status' => 'Rejected']);

                    // Update semua tahapan progress menjadi "completed" untuk menutup proyek
                    Permintaanprogress::where('permintaan_id', $permintaanId)
                        ->where('status', '!=', 'completed')
                        ->update([
                            'status' => 'completed',
                            'percentage' => 100,
                            'description' => 'Tahapan ditutup karena permintaan ditolak',
                        ]);
                }

                $permintaan->update(['status' => 'On Progress']);

                // Log aktivitas
                $progress = Permintaanprogress::where('permintaan_id', $permintaanId)
                    ->where('permintaantahapan_id', 4) // Tahapan ke-4
                    ->first();

                Logaktivitas::create([
                    'permintaanprogress_id' => $progress ? $progress->id : null,
                    'user_id' => $currentUser->id,
                    'action' => 'Update Rekomendasi',
                    'description' => "Rekomendasi: " . ($request->status === 'Approved' ? 'Disetujui' : 'Ditolak'),
                ]);

                // Broadcast event untuk rekomendasi
                event(new PermintaanUpdated(
                    $permintaan,
                    'rekomendasi',
                    [
                        'id' => $rekomendasi->id,
                        'status' => $rekomendasi->status,
                        'created_at' => $rekomendasi->created_at->toISOString(),
                        'progress_id' => $progress ? $progress->id : null,
                    ]
                ));

                // Response
                $responseData = [
                    'message' => 'Rekomendasi berhasil diperbarui',
                    'rekomendasi' => $rekomendasi->toArray(),
                ];

                if ($request->status === 'Rejected') {
                    $responseData['permintaan'] = $permintaan->toArray();
                }

                return response()->json($responseData);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memperbarui rekomendasi: ' . $e->getMessage()], 500);
        }
    }

    public function showSkpl($permintaanId, $tahapanconstrainId = null)
    {
        try {
            $query = RbieExtraction::where('permintaan_id', $permintaanId);
            if ($tahapanconstrainId) {
                $query->where('tahapanconstrain_id', $tahapanconstrainId);
            }
            $skpl = $query->first();

            if (!$skpl) {
                return response()->json(['extracted_data' => []], 200);
            }

            $extractedData = $skpl->extracted_data;
            if (is_array($extractedData)) {
                $finalData = $extractedData;
            } elseif (is_string($extractedData)) {
                $finalData = json_decode($extractedData, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $finalData = [];
                }
            } else {
                $finalData = [];
            }

            return response()->json(['extracted_data' => $finalData], 200);
        } catch (\Exception $e) {
            return response()->json(['extracted_data' => [], 'error' => 'Terjadi kesalahan di server'], 500);
        }
    }

    public function getActivePermintaans(Request $request)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $permintaans = Managing::where('user_id', $userId)
            ->with('permintaan')
            ->get()
            ->map(function ($managing) {
                return [
                    'id' => $managing->id,
                    'permintaan_id' => $managing->permintaan_id,
                    'title' => $managing->permintaan->title ?? 'Permintaan #' . $managing->permintaan_id,
                ];
            });

        return response()->json($permintaans);
    }

    // app/Http/Controllers/PermintaanController.php
    public function dashboard(Request $request)
    {
        $userId = auth()->id();
        $currentUser = Auth::user();

        // Log untuk debugging
        \Log::info("Dashboard accessed by user: {$userId}");

        // Ambil izin pengguna
        $userPermissions = $currentUser->role->permissions->pluck('permintaantahapan_id')->toArray();

        // Statistik
        $managings = Managing::where('user_id', $userId)->with(['permintaan.progress'])->get();
        \Log::info("Managings count for user {$userId}: {$managings->count()}");

        $allPercentages = $managings
            ->flatMap(fn($m) => $m->permintaan && $m->permintaan->progress ? $m->permintaan->progress->pluck('percentage') : []);

        $avgProgress = $allPercentages->avg();

        $stats = [
            'active' => $managings->filter(fn($m) => $m->permintaan && $m->permintaan->progress->where('status', 'current')->isNotEmpty())->count(),
            'avg_progress' => $avgProgress,
            'pending_rekomendasi' => Rekomendasi::whereIn('permintaan_id', $managings->pluck('permintaan_id'))
                ->where('status', 'Pending')
                ->count(),
            'team_members' => Managing::whereIn('permintaan_id', $managings->pluck('permintaan_id'))
                ->distinct('user_id')
                ->count(),
        ];

        // Daftar anggota tim
        $teamMembers = Managing::whereIn('permintaan_id', $managings->pluck('permintaan_id'))
            ->distinct('user_id')
            ->join('users', 'managings.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        // Permintaan aktif
        $activePermintaans = Permintaan::with(['progress'])
            ->whereHas('managings', fn($q) => $q->where('user_id', $userId))
            ->whereHas('progress', fn($q) => $q->where('status', 'current'))
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        \Log::info("Active permintaans count: {$activePermintaans->count()}");

        $activePermintaans = $activePermintaans->map(function ($permintaan) {
            $progressData = $permintaan->progress ?? collect();
            $totalTahapan = $progressData->count();
            $tahapanSelesai = $progressData->where('status', 'completed')->count();
            $progress = $totalTahapan > 0 ? round(($tahapanSelesai / $totalTahapan) * 100, 2) : 0;

            return [
                'id' => $permintaan->id,
                'nomertiket' => $permintaan->nomertiket,
                'title' => $permintaan->title,
                'progress_percentage' => $progress,
                'status' => $permintaan->status,
            ];
        });

        // Log aktivitas terbaru
        $recentLogs = Logaktivitas::whereIn('permintaanprogress_id',
            Permintaanprogress::whereIn('permintaan_id', $managings->pluck('permintaan_id'))->pluck('id')
        )
            ->leftJoin('users', 'logaktivitas.user_id', '=', 'users.id')
            ->select('logaktivitas.*', 'users.name as user_name')
            ->orderBy('logaktivitas.created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'description' => $log->description,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'user_name' => $log->user_name ?? 'Unknown',
            ]);

        \Log::info("Recent logs count: {$recentLogs->count()}");

        // Tugas pending
        $pendingTasks = Constraindata::where('status', 'pending')
            ->whereIn('permintaan_id', $managings->pluck('permintaan_id'))
            ->with(['permintaan', 'tahapanconstrain'])
            ->whereHas('tahapanconstrain', fn($q) => $q->whereIn('permintaantahapan_id', $userPermissions))
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'description' => $task->description,
                'permintaan_title' => $task->permintaan->title ?? 'Unknown',
                'permintaan_id' => $task->permintaan_id,
            ]);

        // Cek izin
        $canAddUsers = in_array($currentUser->role_id, [5]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activePermintaans' => $activePermintaans,
            'recentLogs' => $recentLogs,
            'pendingTasks' => $pendingTasks,
            'teamMembers' => $teamMembers, // Tambahkan data anggota tim
            'canAddUsers' => $canAddUsers,
            'roleId' => $currentUser->role_id,
            'userName' => $currentUser->name,
        ]);
    }
}
