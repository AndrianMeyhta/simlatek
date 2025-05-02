<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Permintaan;
use App\Models\Managing;
use Illuminate\Support\Facades\Auth;
use App\Models\Notifications;
use App\Models\User;

Broadcast::channel('permintaan.{permintaanId}', function ($user, $permintaanId) {
    return Managing::where('permintaan_id', $permintaanId)
        ->where('user_id', $user->id)
        ->exists();
});


Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
