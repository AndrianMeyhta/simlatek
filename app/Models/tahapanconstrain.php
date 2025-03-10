<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tahapanconstrain extends Model
{
    protected $table = 'tahapanconstrains';
    protected $fillable = ['projecttahapan_id', 'constrain_type', 'status'];

    // Relasi ke Projecttahapan
    public function projectTahapan()
    {
        return $this->belongsTo(Projecttahapan::class, 'projecttahapan_id');
    }

    public function projectprogress()
    {
        return $this->hasOne(Projectprogress::class, 'projecttahapan_id', 'projecttahapan_id');
    }

    // Relasi polimorfik ke Dokumenrelasis
    public function dokumenRelasis()
    {
        return $this->morphMany(Dokumenrelasi::class, 'relasi');
    }

    // Relasi untuk mendapatkan dokumen melalui Dokumenrelasis
    public function dokumens()
    {
        return $this->hasManyThrough(Dokumen::class, Dokumenrelasi::class, 'relasi_id', 'id', 'id', 'dokumen_id')
                    ->where('relasi_type', self::class);
    }
}
