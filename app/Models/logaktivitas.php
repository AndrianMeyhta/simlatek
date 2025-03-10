<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class logaktivitas extends Model
{
    protected $table = 'logaktivitas';
    protected $fillable = ['projectprogress_id', 'user_id', 'action', 'description'];

    // Relasi ke Projectprogress
    public function projectprogress()
    {
        return $this->belongsTo(Projectprogress::class, 'projectprogress_id');
    }

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
