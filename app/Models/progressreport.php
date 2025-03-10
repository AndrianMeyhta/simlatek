<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class progressreport extends Model
{
    protected $fillable = ['projectprogress_id', 'description', 'percentage_change'];

    public function projectprogress()
    {
        return $this->belongsTo(Projectprogress::class);
    }
}
