<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category'
    ];

    /**
     * The users that have this skill.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'userskills')
                    ->withPivot('level', 'experience_since', 'notes')
                    ->withTimestamps();
    }
}
