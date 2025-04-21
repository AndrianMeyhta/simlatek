<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function permintaans()
    {
        return $this->hasMany(Permintaan::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'dikelola');
    }

    public function managings()
    {
        return $this->hasMany(Managing::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'userskills')
                    ->withPivot('level', 'experience_since', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get the user skills for the user.
     */
    public function userSkills()
    {
        return $this->hasMany(UserSkill::class);
    }

}
