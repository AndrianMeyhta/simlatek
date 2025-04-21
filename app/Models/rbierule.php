<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class rbierule extends Model
{
    protected $fillable = ['tahapanconstrain_id', 'name', 'preprocessing', 'matching_rules'];
    protected $casts = [
        'preprocessing' => 'array',
        'matching_rules' => 'array',
    ];

    public function tahapanConstrain()
    {
        return $this->belongsTo(TahapanConstrain::class, 'tahapanconstrain_id');
    }
}
