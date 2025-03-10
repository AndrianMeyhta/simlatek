<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class permintaandokumen extends Model
{
    use HasFactory;

    protected $fillable = ['permintaan_id', 'dokumenkategori_id', 'file_path'];

    public function permintaan()
    {
        return $this->belongsTo(Permintaan::class);
    }
}
