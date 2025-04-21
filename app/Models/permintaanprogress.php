<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class permintaanprogress extends Model
{
    use HasFactory;

    protected $fillable = [
        'permintaan_id',
        'permintaantahapan_id',
        'percentage',
        'status',
        'description'
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function permintaan()
    {
        return $this->belongsTo(permintaan::class);
    }

    public function tahapan()
    {
        return $this->belongsTo(permintaanTahapan::class, 'permintaantahapan_id');
    }
    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function tahapanconstrains()
    {
        return $this->hasMany(Tahapanconstrain::class, 'permintaantahapan_id', 'permintaantahapan_id');
    }
}
