<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::insert([
            [
                'name' => 'Admin Diskominfo',
                'email' => 'admin@diskominfo.go.id',
                'password' => Hash::make('password'),
                'role_id' => 5, // Superadmin
            ],
            [
                'name' => 'OPD',
                'email' => 'opd@diskominfo.go.id',
                'password' => Hash::make('password'),
                'role_id' => 1, // OPD
            ]
        ]);
    }
}
