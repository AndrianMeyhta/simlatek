<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RbieRule;

class RbieruleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RbieRule::create([
            'tahapanconstrain_id' => 6, // File SKPL dari tahapanconstrains
            'name' => 'File SKPL Rules',
            'preprocessing' => [
                ['type' => 'replace', 'pattern' => '\s+', 'replacement' => ' '],
                ['type' => 'replace', 'pattern' => '(?<!\.)\s+(?:(?:\d+\.)|(?:SRS-F-[^\s]+))\s+', 'replacement' => '. '],
                ['type' => 'split', 'pattern' => '(?<=[.!?:])\s+'],
            ],
            'matching_rules' => [
                ['pattern' => '[Pp]erangkat\s+[Ll]unak\s+(?:dapat|harus|bisa|akan|mampu)'],
                ['pattern' => '[Ss]istem\s+(?:dapat|harus|bisa|akan|mampu)'],
                ['pattern' => '[Aa]plikasi\s+(?:dapat|harus|bisa|akan|mampu)'],
                ['pattern' => '[Ss]oftware\s+(?:dapat|harus|bisa|akan|mampu)'],
            ],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
