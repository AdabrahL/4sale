<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'property' => new PropertyResource($this->property),
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
            ],
            'receiver' => [
                'id' => $this->receiver->id,
                'name' => $this->receiver->name,
                'email' => $this->receiver->email,
            ],
            'message' => $this->message,
            'is_read' => $this->is_read,
            'reply_to' => $this->reply_to,
            'created_at' => $this->created_at,
            'replies' => MessageResource::collection($this->replies),
        ];
    }
}