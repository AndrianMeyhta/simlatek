<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\UserSessionMiddleware;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\tahapanController;
use App\Http\Controllers\permissionController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\PermintaanController;
use App\Models\Role;
use App\Models\projecttahapan;



Route::controller(AuthController::class)->group(function () {
    Route::get('/', 'showLogin')->name('login');
    Route::post('/login', 'login');
    Route::post('/logout', 'logout')->name('logout');
});

Route::middleware(['auth', UserSessionMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/permintaan/create', [PermintaanController::class, 'create']);
    Route::post('/permintaan', [PermintaanController::class, 'store']);
    Route::get('/permintaan', [PermintaanController::class, 'index'])->name('permintaan.index');
    Route::get('/permintaan/{permintaan}', [PermintaanController::class, 'show'])->name('permintaan.show');
    Route::post('/permintaan/{permintaan}/confirm-step', [PermintaanController::class, 'confirmStep'])->name('permintaan.confirmStep');
    Route::post('/permintaan/{permintaan}/edit-constrain/{constrainId}', [PermintaanController::class, 'editConstrain'])->name('permintaan.editConstrain');

    Route::prefix('manage')->group(function () {
        Route::get('/', function () {
            return Inertia::render('manage', [
                'initialData' => [
                    'roles' => Role::all(),
                    'tahapans' => projecttahapan::all(),
                ],
            ]);
        })->name('manage.index');

        Route::resource('roles', RoleController::class);
        Route::resource('users', UserController::class);
        Route::resource('tahapans', TahapanController::class);
        Route::resource('kategoris', KategoriController::class);

        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/tahapans', [TahapanController::class, 'index']);
        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::post('/permissions/batch-update', [PermissionController::class, 'batchUpdate']);
    });
});
