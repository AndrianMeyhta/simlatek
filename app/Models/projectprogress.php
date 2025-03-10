<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class projectprogress extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'projecttahapan_id',
        'percentage',
        'status',
        'description'
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function tahapan()
    {
        return $this->belongsTo(ProjectTahapan::class, 'projecttahapan_id');
    }
    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function tahapanconstrains()
    {
        return $this->hasMany(Tahapanconstrain::class, 'projecttahapan_id', 'projecttahapan_id');
    }
}
