<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\UserSessionMiddleware;
use App\Http\Controllers\{
    DashboardController,
    AuthController,
    RoleController,
    UserController,
    TahapanController,
    PermissionController,
    KategoriController,
    PermintaanController,
    ConstrainController,
    SkillController,
    UserskillController,
    RbieRuleController,
    RbieExtractionController,
    NotificationController,
};
use App\Models\{User, Skill, Role, permintaantahapan};
use Illuminate\Support\Facades\Broadcast;

// Auth Routes
Route::controller(AuthController::class)->group(function () {
    Route::get('/', 'showLogin')->name('login');
    Route::post('/login', 'login');
    Route::post('/logout', 'logout')->name('logout');
});

// Routes with Auth Middleware
Route::middleware(['auth', UserSessionMiddleware::class])->group(function () {

    Broadcast::routes(['middleware' => ['auth', 'verified']]);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/dashboard', [PermintaanController::class, 'dashboard'])->name('dashboard');

    // Permintaan Routes
    Route::prefix('permintaan')->controller(PermintaanController::class)->group(function () {
        Route::get('/create', 'create');
        Route::post('/', 'store');
        Route::get('/', 'index')->name('permintaan.index');
        Route::get('/{permintaan}', 'show')->name('permintaan.show');
        Route::post('/{permintaan}/confirm-step', 'confirmStep')->name('permintaan.confirm-step');
        Route::post('/{permintaanId}/constrain/{constrainId}', 'updateConstrain')->name('permintaan.edit-constrain');
        Route::post('/{permintaan}/constrain/{constrain}/confirm', 'confirmConstrain')->name('permintaan.confirm-constrain');
        Route::post('/{permintaan}/invite-user', 'inviteUser')->name('permintaan.invite-user');
        Route::post('/{permintaanId}/rekomendasi', 'updateRekomendasi')->name('permintaan.rekomendasi.update');
        Route::post('/{permintaan}/constrain/{constrain}/with-file', 'updateConstrainWithFile');
        Route::get('/{permintaan}/progress-reports/{constrain}', 'getProgressReports');
        Route::get('/{permintaanId}/skpl/{tahapanconstrainId?}', 'showSkpl')->name('permintaan.skpl');
    });

    Route::get('/active-permintaans', [PermintaanController::class, 'getActivePermintaans'])->name('permintaan.active-permintaan');

    // Constrain Routes
    Route::prefix('constrain')->controller(ConstrainController::class)->group(function () {
        Route::get('/', 'index')->name('constrain.index');
        Route::post('/', 'store')->name('constrain.store');
        Route::put('/{constraint}', 'update')->name('constrain.update');
        Route::delete('/{constraint}', 'destroy')->name('constrain.destroy');
    });

    Route::get('/aplikasi', [App\Http\Controllers\ProjectController::class, 'index'])->name('aplikasi.index');
    Route::get('/aplikasi/{project}', [App\Http\Controllers\ProjectController::class, 'show'])->name('aplikasi.show');
    Route::post('/aplikasi/{project}/update-pengelola', [App\Http\Controllers\ProjectController::class, 'updatePengelola'])->name('aplikasi.updatePengelola');

    Route::put('/dashboard/users/{id}', [UserController::class, 'update'])->name('users.update-role');
    // User Management Routes
    Route::prefix('user-management')->controller(UserskillController::class)->group(function () {
        Route::get('/', 'index')->name('user-management.index');
    });

    Route::prefix('users')->controller(UserskillController::class)->group(function () {
        Route::get('/', function () {
            return User::with('role')->get();
        });
        Route::post('/', 'store');
        Route::get('/{user}', 'getUser');
        Route::put('/{user}', 'update');
        Route::delete('/{user}', 'destroy');

        // User Skill Routes
        Route::post('/{user}/skills', 'addSkill');
    });

    Route::prefix('user-skills')->controller(UserskillController::class)->group(function () {
        Route::put('/{userSkill}', 'updateSkill');
        Route::delete('/{userSkill}', 'removeSkill');
    });

    // Skill Routes
    Route::prefix('skills')->group(function () {
        Route::get('/', function () {
            return Skill::all();
        });
        Route::get('/{skillId}/users', [UserskillController::class, 'getUsersWithSkill']);
        Route::post('/', [SkillController::class, 'store']);
        Route::put('/{skill}', [SkillController::class, 'update']);
        Route::delete('/{skill}', [SkillController::class, 'destroy']);
    });

    // Management Routes
    Route::prefix('manage')->group(function () {

        Route::get('/', function () {
            return Inertia::render('manage', [
                'initialData' => [
                    'roles' => Role::all(),
                    'tahapans' => permintaantahapan::all(),
                ],
            ]);
        })->name('manage.index');

        Route::resources([
            'roles' => RoleController::class,
            'tahapans' => TahapanController::class,
            'kategoris' => KategoriController::class,
            'rbierules' => RbieRuleController::class,
            'rbieextractions' => RbieExtractionController::class,
        ]);

        // Permission Routes
        Route::get('/permissions', [PermissionController::class, 'index'])->name('manage.permissions');
        Route::post('/permissions/batch-update', [PermissionController::class, 'batchUpdate'])->name('manage.permissions.batch-update');
    });

});
