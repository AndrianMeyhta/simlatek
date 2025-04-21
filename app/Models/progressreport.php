<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class progressreport extends Model
{
    protected $fillable = ['permintaanprogress_id', 'description', 'percentage_change'];

    public function permintaanprogress()
    {
        return $this->belongsTo(Permintaanprogress::class);
    }

    public function documents()
    {
        return $this->morphMany(Dokumenrelasi::class, 'relasi')->with('dokumen');
    }
}
