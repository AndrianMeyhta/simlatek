<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class role extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function permissions()
    {
        return $this->hasMany(Permission::class, 'role_id', 'id');
    }

    // Opsional: Relasi ke Projecttahapan melalui Permission
    public function projectTahapans()
    {
        return $this->belongsToMany(Projecttahapan::class, 'permissions', 'role_id', 'projecttahapan_id');
    }

}
