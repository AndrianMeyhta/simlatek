<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class rbieextraction extends Model
{
    protected $table = 'rbieextractions';
    protected $fillable = ['permintaan_id', 'tahapanconstrain_id', 'extracted_data'];
    protected $casts = [
        'extracted_data' => 'array'
    ];

    public function permintaan()
    {
        return $this->belongsTo(Permintaan::class, 'permintaan_id');
    }
    public function dokumenRelasi()
    {
        return $this->morphOne(DokumenRelasi::class, 'relasi');
    }
}
