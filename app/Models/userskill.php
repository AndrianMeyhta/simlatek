<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSkill extends Model
{
    use HasFactory;

    protected $table = 'userskills';

    protected $fillable = [
        'user_id',
        'skill_id',
        'level',
        'experience_since',
        'notes'
    ];

    /**
     * Get the user that owns the skill.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the skill associated with the user.
     */
    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }
}
