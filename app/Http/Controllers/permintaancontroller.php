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
        // Ambil data permintaan beserta relasinya
        $permintaan->load([
            'projects' => function ($query) {
                $query->with([
                    'progress' => function ($query) {
                        $query->with(['tahapan', 'tahapanconstrains']);
                    },
                    'dikelola' // Pengelola proyek (user)
                ]);
            },
            'users' // Pengaju permintaan
        ]);

        // Ambil log aktivitas terkait semua projectprogress
        $logAktivitas = Logaktivitas::whereIn('projectprogress_id',
            $permintaan->projects->progress->pluck('id')
        )->with('users')->orderBy('created_at', 'desc')->get();

        // Ambil hak akses pengguna saat ini dari tabel permissions
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
    public function confirmStep(Request $request, Permintaan $permintaan)
    {
        $request->validate([
            'projectprogressId' => 'required|exists:projectprogresses,id',
        ]);

        $projectprogress = Projectprogress::findOrFail($request->projectprogressId);

        // Cek apakah pengguna memiliki izin untuk tahapan ini berdasarkan permissions
        $userPermissions = Auth::user()->role->permissions->pluck('projecttahapan_id')->toArray();
        if (!in_array($projectprogress->projecttahapan_id, $userPermissions)) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengonfirmasi tahapan ini.'], 403);
        }

        // Cek apakah semua constrain telah dipenuhi
        $constrains = $projectprogress->tahapanconstrains;
        if ($constrains->where('status', 'pending')->count() > 0) {
            return response()->json(['message' => 'Semua constrain harus dipenuhi sebelum mengonfirmasi tahapan.'], 400);
        }

        // Update status projectprogress menjadi 'completed'
        $projectprogress->update(['status' => 'completed']);

        // Lanjutkan ke tahapan berikutnya (set status 'current')
        $nextProgress = Projectprogress::where('project_id', $projectprogress->project_id)
            ->where('id', '>', $projectprogress->id)
            ->orderBy('id')
            ->first();

        if ($nextProgress) {
            $nextProgress->update(['status' => 'current']);
        }

        // Catat log aktivitas
        Logaktivitas::create([
            'projectprogress_id' => $projectprogress->id,
            'user_id' => Auth::id(),
            'action' => 'konfirmasi tahapan',
            'description' => 'Tahapan ' . $projectprogress->projectTahapan->name . ' telah dikonfirmasi.',
        ]);

        return response()->json(['message' => 'Tahapan berhasil dikonfirmasi dan dilanjutkan ke tahapan berikutnya.']);
    }

    public function editConstrain(Request $request, Permintaan $permintaan, $constrainId)
    {
        $request->validate([
            'constrain_type' => 'required|string',
            'status' => 'required|in:pending,fulfilled',
        ]);

        $constrain = Tahapanconstrain::findOrFail($constrainId);

        // Cek apakah pengguna memiliki izin untuk tahapan ini berdasarkan permissions
        $userPermissions = Auth::user()->role->permissions->pluck('projecttahapan_id')->toArray();
        if (!in_array($constrain->projecttahapan_id, $userPermissions)) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit constrain ini.'], 403);
        }

        // Update constrain
        $constrain->update([
            'constrain_type' => $request->constrain_type,
            'status' => $request->status,
        ]);

        // Catat log aktivitas
        Logaktivitas::create([
            'projectprogress_id' => $constrain->projectprogress->id,
            'user_id' => Auth::id(),
            'action' => 'edit constrain',
            'description' => 'Constrain ' . $constrain->constrain_type . ' pada tahapan ' . $constrain->projectTahapan->name . ' telah diedit.',
        ]);

        return response()->json(['message' => 'Constrain berhasil diedit.']);
    }
}
