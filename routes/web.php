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
use App\Http\Controllers\ConstrainController;
use App\Models\Role;
use App\Models\projecttahapan;



Route::controller(AuthController::class)->group(function () {
    Route::get('/', 'showLogin')->name('login');
    Route::post('/login', 'login');
    Route::post('/logout', 'logout')->name('logout');
});

Route::middleware(['auth', UserSessionMiddleware::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('permintaan')->controller(PermintaanController::class)->group(function () {
        Route::get('/create', 'create');
        Route::post('/', 'store');
        Route::get('/', 'index')->name('permintaan.index');
        Route::get('/{permintaan}', 'show')->name('permintaan.show');
        Route::post('/{permintaan}/confirm-step', 'confirmStep')->name('permintaan.confirm-step');
        Route::post('/{permintaanId}/constrain/{constrainId}', 'updateConstrain')->name('permintaan.edit-constrain');
        Route::post('/{permintaan}/constrain/{constrain}/confirm', 'confirmConstrain')->name('permintaan.confirm-constrain');
    });

    Route::get('/constrain', [ConstrainController::class, 'index'])->name('constrain.index');
    Route::post('/constrain', [ConstrainController::class, 'store'])->name('constrain.store');
    Route::put('/constrain/{constraint}', [ConstrainController::class, 'update'])->name('constrain.update');
    Route::delete('/constrain/{constraint}', [ConstrainController::class, 'destroy'])->name('constrain.destroy');

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
