<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class logaktivitas extends Model
{
    protected $table = 'logaktivitas';
    protected $fillable = ['permintaanprogress_id', 'user_id', 'action', 'description'];

    // Relasi ke permintaanprogress
    public function permintaanprogress()
    {
        return $this->belongsTo(permintaanprogress::class, 'permintaanprogress_id');
    }

    // Relasi ke User
    public function users()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
