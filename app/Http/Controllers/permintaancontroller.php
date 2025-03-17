<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Permintaan;
use App\Models\Project;
use App\Models\Projectprogress;
use App\Models\Dokumen;
use App\Models\DokumenRelasi;
use App\Models\Projecttahapan;
use App\Models\logaktivitas;
use App\Models\tahapanconstrain;
use App\Models\Rapat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PermintaanController extends Controller
{
    public function index()
    {
        // Ambil semua permintaan beserta relasi project dan projectprogresses
        $permintaans = Permintaan::with(['projects.progress'])->get();

        // Hitung progress pengerjaan untuk setiap permintaan
        $permintaans = $permintaans->map(function ($permintaan) {
            $totalTahapan = $permintaan->projects->progress->count();
            $tahapanSelesai = $permintaan->projects->progress->where('status', 'completed')->count();
            $progress = $totalTahapan > 0 ? round(($tahapanSelesai / $totalTahapan) * 100, 2) : 0;
            $permintaan->progress = $progress;
            return $permintaan;
        });

        return Inertia::render('Permintaan/index', [
            'permintaans' => $permintaans,
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
            'suratPermohonan' => 'required|file|max:10240', // Maks 10MB
            'dataUsulan' => 'required|file|max:10240',
            'petaPerencanaan' => 'required|file|max:10240',
        ]);

        // Generate nomertiket: YYYYMMDD + jumlah permintaan hari ini
        $today = now()->format('Ymd');
        $count = Permintaan::whereDate('created_at', now()->toDateString())->count() + 1;
        $nomertiket = $today . str_pad($count, 3, '0', STR_PAD_LEFT);

        // Buat permintaan
        $permintaan = Permintaan::create([
            'user_id' => Auth::user()->id, // Asumsi user login
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'New',
            'nomertiket' => $nomertiket,
            'anggaran' => $request->anggaran,
        ]);

        // Upload dan simpan dokumen
        $dokumenCategories = [
            'suratPermohonan' => 1, // Surat Permohonan
            'dataUsulan' => 2,      // Data Usulan
            'petaPerencanaan' => 3, // Peta Perencanaan SPBE
        ];

        foreach ($dokumenCategories as $key => $categoryId) {
            $file = $request->file($key);
            $filepath = $file->store('dokumen', 'public'); // Simpan di storage/public/dokumen

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

        // Buat project otomatis
        $project = Project::create([
            'name' => $request->title,
            'description' => $request->description,
            'permintaan_id' => $permintaan->id,
            'dikelola' => 1, // User ID = 1 sebagai default pengelola
        ]);

        // Buat progres tahapan
        Projectprogress::create([
            'project_id' => $project->id,
            'projecttahapan_id' => 1,
            'percentage' => 100,
            'status' => 'completed', // Sesuai enum di database
            'description' => 'User membuat permintaan',
        ]);

        $tahapan = Projecttahapan::orderBy('id')->get();
        $stepCounter = 0;

        foreach ($tahapan as $step) {
            $existingProgress = $project->progress->firstWhere('projecttahapan_id', $step->id);
            $stepCounter++;
            if (!$existingProgress) {
                Projectprogress::create([
                    'project_id' => $project->id,
                    'projecttahapan_id' => $step->id,
                    'percentage' => 0,
                    'status' => ($stepCounter == 2) ? 'current' : 'upcoming',
                    'description' => ($stepCounter == 2) ? 'Tahapan sedang berjalan' : 'Tahapan belum dimulai',
                ]);
            }
        }

        return response()->json(['message' => 'Permintaan berhasil dibuat'], 201);
    }

    public function show(Permintaan $permintaan)
    {
        $permintaan->load([
            'projects' => function ($query) {
                $query->with([
                    'progress' => function ($query) {
                        $query->with(['tahapan' => function ($query) {
                            $query->withDefault(['name' => 'Tahapan Tidak Diketahui']);
                        }, 'tahapanconstrains']);
                    },
                    'dikelola'
                ]);
            },
            'users'
        ]);

        $logAktivitas = Logaktivitas::whereIn('projectprogress_id', $permintaan->projects->progress->pluck('id'))
            ->with('users')
            ->orderBy('created_at', 'desc')
            ->get();

        $userPermissions = Auth::user()->role->permissions->pluck('projecttahapan_id')->toArray();

        return Inertia::render('Permintaan/show', [
            'permintaan' => $permintaan,
            'project' => $permintaan->projects,
            'projectprogresses' => $permintaan->projects->progress,
            'logAktivitas' => $logAktivitas,
            'userPermissions' => $userPermissions,
        ]);
    }

    /**
     * Menangani konfirmasi tahapan dan transisi ke tahapan berikutnya
     */
    public function updateConstrain(Request $request, $permintaanId, $constrainId)
    {
        $constrain = TahapanConstrain::findOrFail($constrainId);
        $progress = ProjectProgress::where('project_id', $request->project_id)
            ->where('projecttahapan_id', $constrain->projecttahapan_id)
            ->firstOrFail();

        $constraindata = Constraindata::firstOrCreate([
            'project_id' => $progress->project_id,
            'tahapanconstrain_id' => $constrain->id,
        ]);

        if ($request->constrain_type === 'upload_file' && $request->hasFile('file')) {
            $file = $request->file('file');
            if ($file->getSize() > 10 * 1024 * 1024) {
                return response()->json(['message' => 'File terlalu besar'], 422);
            }
            $path = $file->store('public/constraints');
            $constraindata->update([
                'file_path' => $path,
                'status' => $request->status,
            ]);
        } elseif ($request->constrain_type === 'schedule' || $request->constrain_type === 'text') {
            $constraindata->update([
                'value' => $request->value,
                'status' => $request->status,
            ]);
        }

        return response()->json(['message' => 'Constrain updated']);
    }

    public function confirmConstrain(Request $request, $permintaanId, $constrainId)
    {
        $constraindata = Constraindata::where('tahapanconstrain_id', $constrainId)
            ->where('project_id', $request->project_id)
            ->firstOrFail();
        $constraindata->update(['status' => 'confirmed']);
        return response()->json(['message' => 'Constrain confirmed']);
    }

    public function confirmStep(Request $request, $permintaanId)
    {
        try {
            \DB::transaction(function () use ($request) {
                $progress = ProjectProgress::findOrFail($request->projectprogressId);
                $nextProgress = ProjectProgress::where('project_id', $progress->project_id)
                    ->where('id', '>', $progress->id)
                    ->orderBy('id', 'asc')
                    ->first();

                $progress->update(['status' => 'completed', 'percentage' => 100]);

                if ($nextProgress) {
                    $nextProgress->update(['status' => 'current']);
                    $tahapanConstrains = TahapanConstrain::where('projecttahapan_id', $nextProgress->projecttahapan_id)->get();
                    foreach ($tahapanConstrains as $constrain) {
                        Constraindata::firstOrCreate([
                            'project_id' => $nextProgress->project_id,
                            'tahapanconstrain_id' => $constrain->id,
                            'status' => 'pending',
                        ]);
                    }
                }

                Logaktivitas::create([
                    'projectprogress_id' => $progress->id,
                    'user_id' => Auth::id(),
                    'action' => 'confirm_step',
                    'description' => 'Tahapan ' . $progress->tahapan->name . ' dikonfirmasi',
                ]);
            });

            return response()->json(['message' => 'Tahapan berhasil dikonfirmasi']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengonfirmasi tahapan: ' . $e->getMessage()], 500);
        }
    }
}
