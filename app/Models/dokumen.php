<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class dokumen extends Model
{
    use HasFactory;

    protected $fillable = ['filename', 'filepath', 'dokumenkategori_id'];

    public function dokumenkategori()
    {
        return $this->belongsTo(Dokumenkategori::class);
    }

    public function dokumenRelasis()
    {
        return $this->hasMany(DokumenRelasi::class);
    }
}
