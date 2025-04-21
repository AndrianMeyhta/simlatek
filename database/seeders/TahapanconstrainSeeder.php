<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TahapanConstrain;

class TahapanconstrainSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'id' => 1,
                'permintaantahapan_id' => 2,
                'name' => 'Jadwal Rapat',
                'type' => 'schedule',
                'detail' => [
                    'name' => 'Jadwal Rapat',
                    'required' => true,
                    'target_table' => 'rapats',
                    'target_column' => 'jadwalrapat',
                    'dokumenkategori_id' => null,
                    'relasi' => null,
                ],
                'created_at' => '2025-04-06 17:25:13',
                'updated_at' => '2025-04-06 17:25:13',
            ],
            [
                'id' => 2,
                'permintaantahapan_id' => 3,
                'name' => 'Daftar Hadir',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'Daftar Hadir',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 5,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Rapat',
                ],
                'created_at' => '2025-04-06 17:28:48',
                'updated_at' => '2025-04-06 17:28:48',
            ],
            [
                'id' => 3,
                'permintaantahapan_id' => 3,
                'name' => 'Notulensi',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'Notulensi',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 6,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Rapat',
                ],
                'created_at' => '2025-04-06 17:29:13',
                'updated_at' => '2025-04-06 17:29:13',
            ],
            [
                'id' => 4,
                'permintaantahapan_id' => 3,
                'name' => 'Dokumentasi',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'Dokumentasi',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 7,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Rapat',
                ],
                'created_at' => '2025-04-06 17:29:39',
                'updated_at' => '2025-04-06 17:29:39',
            ],
            [
                'id' => 5,
                'permintaantahapan_id' => 4,
                'name' => 'Rekomendasi',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'Rekomendasi',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 8,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Rekomendasi',
                ],
                'created_at' => '2025-04-06 17:29:58',
                'updated_at' => '2025-04-06 17:29:58',
            ],
            [
                'id' => 6,
                'permintaantahapan_id' => 5,
                'name' => 'File SKPL',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'File SKPL',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 9,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Project',
                ],
                'created_at' => '2025-04-06 17:30:29',
                'updated_at' => '2025-04-06 17:30:29',
            ],
            [
                'id' => 7,
                'permintaantahapan_id' => 5,
                'name' => 'Dokumen Rancang Bangun',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'Dokumen Rancang Bangun',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 10,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Project',
                ],
                'created_at' => '2025-04-06 17:30:48',
                'updated_at' => '2025-04-06 17:30:48',
            ],
            [
                'id' => 8,
                'permintaantahapan_id' => 6,
                'name' => 'Development Progress',
                'type' => 'progress',
                'detail' => [
                    'name' => 'Development Progress',
                    'required' => true,
                    'target_table' => 'progressreports',
                    'target_columns' => ['description', 'percentage_change'],
                    'dokumenkategori_id' => null,
                    'relasi' => null,
                ],
                'created_at' => '2025-04-06 17:31:01',
                'updated_at' => '2025-04-06 17:31:01',
            ],
            [
                'id' => 10,
                'permintaantahapan_id' => 7,
                'name' => 'Testing Progress',
                'type' => 'progress',
                'detail' => [
                    'name' => 'Testing Progress',
                    'required' => true,
                    'target_table' => 'progressreports',
                    'target_columns' => ['description', 'percentage_change'],
                    'dokumenkategori_id' => null,
                    'relasi' => null,
                ],
                'created_at' => '2025-04-06 17:31:58',
                'updated_at' => '2025-04-06 17:31:58',
            ],
            [
                'id' => 11,
                'permintaantahapan_id' => 7,
                'name' => 'File Testing',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'File Testing',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 12,
                    'isTesting' => true,
                    'relasi' => 'App\\Models\\Project',
                    'testingtype' => 'Fungsi',
                ],
                'created_at' => '2025-04-06 17:32:36',
                'updated_at' => '2025-04-08 16:34:38',
            ],
            [
                'id' => 12,
                'permintaantahapan_id' => 2,
                'name' => 'File Undangan',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'File Undangan',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 4,
                    'isTesting' => false,
                    'relasi' => 'App\\Models\\Rapat',
                ],
                'created_at' => '2025-04-08 04:34:33',
                'updated_at' => '2025-04-08 04:34:33',
            ],
            [
                'id' => 13,
                'permintaantahapan_id' => 8,
                'name' => 'File Testing',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'File Testing',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 12,
                    'isTesting' => true,
                    'relasi' => 'App\\Models\\Project',
                    'testingtype' => 'Keamanan',
                ],
                'created_at' => '2025-04-08 15:56:33',
                'updated_at' => '2025-04-08 15:56:33',
            ],
            [
                'id' => 14,
                'permintaantahapan_id' => 9,
                'name' => 'File Testing',
                'type' => 'upload_file',
                'detail' => [
                    'name' => 'File Testing',
                    'required' => true,
                    'target_table' => 'dokumens',
                    'target_column' => 'filepath',
                    'dokumenkategori_id' => 12,
                    'isTesting' => true,
                    'relasi' => 'App\\Models\\Project',
                    'testingtype' => 'Performa',
                ],
                'created_at' => '2025-04-08 15:57:09',
                'updated_at' => '2025-04-08 15:57:09',
            ],
            [
                'id' => 16,
                'permintaantahapan_id' => 10,
                'name' => 'Domain Sementara',
                'type' => 'text',
                'detail' => [
                    'name' => 'Domain Sementara',
                    'required' => true,
                    'target_table' => 'domainlinks',
                    'target_column' => 'links',
                    'is_domain' => true,
                    'domain_type' => 'sementara',
                    'dokumenkategori_id' => null,
                    'relasi' => null,
                ],
                'created_at' => '2025-04-08 17:17:20',
                'updated_at' => '2025-04-08 17:25:48',
            ],
        ];

        foreach ($data as $item) {
            TahapanConstrain::updateOrCreate(
                ['id' => $item['id']],
                [
                    'permintaantahapan_id' => $item['permintaantahapan_id'],
                    'name' => $item['name'],
                    'type' => $item['type'],
                    'detail' => $item['detail'],
                    'created_at' => $item['created_at'],
                    'updated_at' => $item['updated_at'],
                ]
            );
        }
    }
}
