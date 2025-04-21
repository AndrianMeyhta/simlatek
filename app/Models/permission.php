<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class permission extends Model
{
    protected $fillable = [
        'role_id',
        'permintaantahapan_id'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function tahapan()
    {
        return $this->belongsTo(permintaantahapan::class, 'permintaantahapan_id');
    }
}
