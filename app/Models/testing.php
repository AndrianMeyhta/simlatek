<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class testing extends Model
{
    protected $fillable = ['project_id', 'testingtype', 'description'];

    protected $casts = [
        'testingtype' => 'string',
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
                    ->where('relasi_type', Testing::class);
    }
}
