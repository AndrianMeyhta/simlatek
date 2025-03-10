<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class project extends Model
{
    use HasFactory;


    protected $fillable = [
        'name',
        'description',
        'permintaan_id',
        'dikelola',
    ];

    public function permintaan()
    {
        return $this->belongsTo(Permintaan::class);
    }

    public function dikelola()
    {
        return $this->belongsTo(User::class, 'dikelola');
    }

    public function progress()
    {
        return $this->hasMany(ProjectProgress::class);
    }

    public function rapats()
    {
        return $this->hasOne(Rapat::class);
    }

    public function rekomendasis()
    {
        return $this->hasOne(Rekomendasi::class);
    }

    public function testings()
    {
        return $this->hasMany(Testing::class);
    }

    public function domainlinks()
    {
        return $this->hasMany(Domainlink::class);
    }

    public function dokumenRelasis()
    {
        return $this->morphMany(DokumenRelasi::class, 'relasi');
    }

    public function dokumens()
    {
        return $this->hasManyThrough(Dokumen::class, DokumenRelasi::class, 'relasi_id', 'id', 'id', 'dokumen_id')
                    ->where('relasi_type', Project::class);
    }
}
