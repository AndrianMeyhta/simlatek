<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        permission::insert([
            ['role_id' => 5, 'permintaantahapan_id' => 1],
            ['role_id' => 5, 'permintaantahapan_id' => 2],
            ['role_id' => 5, 'permintaantahapan_id' => 3],
            ['role_id' => 5, 'permintaantahapan_id' => 4],
            ['role_id' => 5, 'permintaantahapan_id' => 5],
            ['role_id' => 5, 'permintaantahapan_id' => 6],
            ['role_id' => 5, 'permintaantahapan_id' => 7],
            ['role_id' => 5, 'permintaantahapan_id' => 8],
            ['role_id' => 5, 'permintaantahapan_id' => 9],
            ['role_id' => 5, 'permintaantahapan_id' => 10],
            ['role_id' => 5, 'permintaantahapan_id' => 11],
            ['role_id' => 5, 'permintaantahapan_id' => 12],
            ['role_id' => 5, 'permintaantahapan_id' => 13],
            ['role_id' => 5, 'permintaantahapan_id' => 14],
            ['role_id' => 5, 'permintaantahapan_id' => 15],
        ]);

    }
}
