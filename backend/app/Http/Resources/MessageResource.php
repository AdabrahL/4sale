<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'property_id'=> $this->property_id,
            'sender_id'  => $this->sender_id,
            'receiver_id'=> $this->receiver_id,
            'message'    => $this->message,
            'is_read'    => $this->is_read,
            'reply_to'   => $this->reply_to,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'property'   => new \App\Http\Resources\PropertyResource($this->whenLoaded('property')),
            'sender'     => new \App\Http\Resources\UserResource($this->whenLoaded('sender')),
            'receiver'   => new \App\Http\Resources\UserResource($this->whenLoaded('receiver'))
        ];
    }
}