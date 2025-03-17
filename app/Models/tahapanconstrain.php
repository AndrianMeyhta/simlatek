<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class tahapanconstrain extends Model
{
    use HasFactory;

    protected $table = 'tahapanconstrains';

    protected $fillable = [
        'projecttahapan_id',
        'name',
        'type',
        'detail',
    ];

    // Jika detail tetap sebagai JSON, Anda bisa gunakan casts
    protected $casts = [
        'detail' => 'array',
    ];

    // Relasi ke Projecttahapan
    public function projectTahapan()
    {
        return $this->belongsTo(ProjectTahapan::class, 'projecttahapan_id');
    }

    // Relasi ke Constraindata
    public function constraindata()
    {
        return $this->hasMany(Constraindata::class, 'tahapanconstrain_id');
    }

    public function projectprogress()
    {
        return $this->hasOne(Projectprogress::class, 'projecttahapan_id', 'projecttahapan_id');
    }
}
