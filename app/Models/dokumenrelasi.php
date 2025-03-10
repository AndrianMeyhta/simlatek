<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class dokumenrelasi extends Model
{
    use HasFactory;

    protected $fillable = ['dokumen_id', 'relasi_type', 'relasi_id'];

    public function dokumen()
    {
        return $this->belongsTo(Dokumen::class);
    }

    public function relasi()
    {
        return $this->morphTo();
    }
}
