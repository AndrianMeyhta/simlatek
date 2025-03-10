<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class rekomendasi extends Model
{
    protected $fillable = ['project_id', 'status'];

    protected $casts = [
        'status' => 'string',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function dokumenRelasis()
    {
        return $this->morphMany(DokumenRelasi::class, 'relasi');
    }

    public function dokumens()
    {
        return $this->hasManyThrough(Dokumen::class, DokumenRelasi::class, 'relasi_id', 'id', 'id', 'dokumen_id')
                    ->where('relasi_type', Rekomendasi::class);
    }
}
