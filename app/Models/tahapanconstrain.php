<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class tahapanconstrain extends Model
{
    use HasFactory;

    protected $table = 'tahapanconstrains';

    protected $fillable = [
        'permintaantahapan_id',
        'name',
        'type',
        'detail',
    ];

    // Jika detail tetap sebagai JSON, Anda bisa gunakan casts
    protected $casts = [
        'detail' => 'array',
    ];

    // Relasi ke Permintaantahapan
    public function permintaantahapan()
    {
        return $this->belongsTo(PermintaanTahapan::class, 'permintaantahapan_id');
    }

    public function constraindata()
    {
        return $this->hasOne(Constraindata::class, 'tahapanconstrain_id');
    }

    public function projectprogress()
    {
        return $this->hasOne(Projectprogress::class, 'permintaantahapan_id', 'permintaantahapan_id');
    }

    // Accessor untuk parsing detail sebagai array
    public function getDetailAttribute($value)
    {
        return json_decode($value, true) ?: [];
    }

    public function progressreports() {
        return $this->hasMany(ProgressReport::class, 'tahapanconstrain_id');
    }
}
