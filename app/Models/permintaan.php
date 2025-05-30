<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class permintaan extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'title', 'description', 'status', 'nomertiket', 'anggaran'];

    protected $casts = [
        'status' => 'string',
    ];

    public function project()
    {
        return $this->hasOne(Project::class);
    }

    public function progress()
    {
        return $this->hasMany(PermintaanProgress::class);
    }

    public function dokumenRelasis()
    {
        return $this->morphMany(DokumenRelasi::class, 'relasi');
    }

    public function dokumens()
    {
        return $this->hasManyThrough(Dokumen::class, DokumenRelasi::class, 'relasi_id', 'id', 'id', 'dokumen_id')
                    ->where('relasi_type', Permintaan::class);
    }

    public function users()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function managings()
    {
        return $this->hasMany(Managing::class);
    }

    public function rbieExtractions()
    {
        return $this->hasMany(RbieExtraction::class);
    }
}
