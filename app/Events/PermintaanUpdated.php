<?php

namespace App\Events;

use App\Models\Permintaan;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermintaanUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $permintaan;
    public $action;
    public $data;

    public function __construct(Permintaan $permintaan, string $action, array $data = [])
    {
        $this->permintaan = $permintaan;
        $this->action = $action;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('permintaan.' . $this->permintaan->id);
    }

    public function broadcastAs()
    {
        return 'permintaan.updated';
    }

    public function broadcastWith()
    {
        return [
            'permintaan_id' => $this->permintaan->id,
            'action' => $this->action,
            'data' => $this->data,
        ];
    }
}
