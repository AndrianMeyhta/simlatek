<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class permission extends Model
{
    protected $fillable = [
        'role_id',
        'projecttahapan_id'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function projectTahapan()
    {
        return $this->belongsTo(Projecttahapan::class, 'projecttahapan_id');
    }
}
