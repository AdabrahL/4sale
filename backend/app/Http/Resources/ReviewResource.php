<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'rating'     => $this->rating,
            'comment'    => $this->comment,
            'user_id'    => $this->user_id,
            'user_name'  => $this->user->name ?? 'Anonymous',
            'property_id'=> $this->property_id,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }

    /**
     * Add a consistent wrapper for the resource response.
     */
    public function with(Request $request): array
    {
        return [
            'status' => 'success',
        ];
    }
}
