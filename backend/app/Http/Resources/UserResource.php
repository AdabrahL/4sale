<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'    => $this->id,
            'name'  => $this->name,
            'email' => $this->email,
            // Add this if you store avatars/photos on user accounts:
            'photo' => $this->photo ?? null,
            // Add more fields if your frontend needs them!
        ];
    }
}