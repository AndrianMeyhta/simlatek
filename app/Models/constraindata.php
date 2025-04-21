<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class constraindata extends Model
{
    use HasFactory;

    protected $table = 'constraindatas';

    protected $fillable = ['permintaan_id', 'tahapanconstrain_id', 'status'];

    protected $casts = [
        'status' => 'string',
    ];

    // Relasi ke permintaan
    public function permintaan()
    {
        return $this->belongsTo(permintaan::class);
    }

    // Relasi ke TahapanConstrain
    public function tahapanconstrain()
    {
        return $this->belongsTo(TahapanConstrain::class, 'tahapanconstrain_id');
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
