<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notifications;
use Illuminate\Support\Facades\Auth;

class notificationcontroller extends Controller
{
    public function index()
    {
        $notifications = Notifications::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();
        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = Notifications::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();
        $notification->update(['is_read' => true]);
        return response()->json(['message' => 'Notification marked as read']);
    }
}
