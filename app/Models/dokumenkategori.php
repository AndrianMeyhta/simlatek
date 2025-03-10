<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class dokumenkategori extends Model
{
    protected $fillable = ['name'];

    public function dokumens()
    {
        return $this->hasMany(Dokumen::class);
    }
}
