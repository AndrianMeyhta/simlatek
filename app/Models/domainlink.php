<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class domainlink extends Model
{
    use HasFactory;
    protected $fillable = ['project_id', 'links', 'typedomain'];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
