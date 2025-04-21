<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class managing extends Model
{
    use HasFactory;
    protected $table = 'managings'; // Nama tabel di database

    protected $fillable = ['user_id', 'permintaan_id', 'role'];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Permintaan
    public function permintaan()
    {
        return $this->belongsTo(Permintaan::class);
    }
}
