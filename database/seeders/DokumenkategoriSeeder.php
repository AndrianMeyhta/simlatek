<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DokumenKategori;

class DokumenkategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DokumenKategori::insert([
            ['name' => 'Surat Permohonan'],
            ['name' => 'Data Usulan'],
            ['name' => 'Peta Perencanaan SPBE'],
        ]);
    }
}
