<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class permintaantahapan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description'
    ];
    public function permission()
    {
        return $this->hasMany(Permission::class, 'permintaantahapan_id');
    }

    public function projectProgresses()
    {
        return $this->hasMany(ProjectProgress::class);
    }
}
