<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\projecttahapan;

class ProjecttahapanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tahapan = [
            [
                'name' => 'Pengajuan Aplikasi',
                'description' => 'Mengisi formulir pengajuan aplikasi melalui sistem untuk diajukan ke Diskominfo.'
            ],
            [
                'name' => 'Pengumuman Rapat',
                'description' => 'Mengumumkan jadwal rapat (offline/online) guna menjelaskan rancangan teknis sebelum membuat permintaan pembangunan aplikasi.'
            ],
            [
                'name' => 'Hasil Rapat',
                'description' => 'Hasil rapat berupa notulen dan dokumen terkait diunggah ke dalam sistem sebagai dasar rekomendasi.'
            ],
            [
                'name' => 'Pemberian Rekomendasi',
                'description' => 'Memberikan rekomendasi apakah permintaan pembangunan aplikasi disetujui atau tidak.'
            ],
            [
                'name' => 'Upload Dokumen SKPL dan Rancang Bangun',
                'description' => 'Mengunggah dokumen SKPL (Spesifikasi Kebutuhan Perangkat Lunak) dan rancang bangun aplikasi.'
            ],
            [
                'name' => 'Proses Pembuatan Aplikasi',
                'description' => 'Petugas memulai pengembangan aplikasi, memilih tim pengembang, mengupdate progres pengerjaan, dan mengatur timeline proyek.'
            ],
            [
                'name' => 'Uji Fitur Aplikasi',
                'description' => 'Upload hasil uji fitur dan mengunggah dokumen hasil uji ke sistem, serta mengkonfirmasi apakah aplikasi bisa lanjut ke tahap berikutnya.'
            ],
            [
                'name' => 'Uji Keamanan Aplikasi',
                'description' => 'Upload hasil uji keamanan terhadap aplikasi (jaringan, virus, dan keamanan lainnya) serta mengupload hasil uji ke dalam sistem.'
            ],
            [
                'name' => 'Stress Test dan Uji Non Fungsionalitas',
                'description' => 'Uplaod hasil uji non fungsionalitas, seperti stress test dan performa aplikasi, lalu mengupload hasilnya ke sistem.'
            ],
            [
                'name' => 'Pemberian Domain Sementara',
                'description' => 'Pemberian domain sementara kepada OPD untuk pengujian'
            ],
            [
                'name' => 'Upload Manual Book',
                'description' => 'Mengunggah manual book aplikasi ke dalam sistem sebagai panduan penggunaan aplikasi.'

            ],
            [
                'name' => 'Pemberian Domain Live oleh Kominfo Staff TIK',
                'description' => 'Pemberian domain live/asli sesuai dengan formulir layanan yang diajukan OPD dan mengkonfirmasi setelah memberikan domain sementara.'
            ],
            [
                'name' => 'Instalasi Aplikasi di Server',
                'description' => 'Pemasangan aplikasi di server dan mengkonfirmasi setelah instalasi dengan mengunggah bukti foto dalam format JPG.'
            ],
            [
                'name' => 'Aktivasi Subdomain Aplikasi',
                'description' => 'Pengaktifkan subdomain aplikasi dengan domain resmi sidoarjokab.go.id dan mengkonfirmasi di sistem.'
            ],
            [
                'name' => 'Upload File PSE dan Penutupan Proyek',
                'description' => 'Mengunggah file PSE ke dalam sistem dan menutup proyek setelah semua tahap selesai.'
            ]
        ];
        projecttahapan::insert($tahapan);
    }
}
