<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        //
        Role::insert([
            ['name' => 'OPD'],
            ['name' => 'TKI_Egov'],
            ['name' => 'TKI_Aplikasi'],
            ['name' => 'TIK'],
            ['name' => 'Superadmin'],
        ]);
    }
}
