<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // Decode stored images JSON safely
        $images = is_string($this->images) ? json_decode($this->images, true) : $this->images;
        $images = $images ?? [];

        // Convert relative paths into full URLs
        $imageUrls = array_map(function ($path) {
            return Storage::url($path); // gives /storage/properties/...
        }, $images);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'location' => $this->location,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'size' => $this->size,
            'images' => $imageUrls,
            'user_id' => $this->user_id,
            'is_favorited' => $request->user()
                ? $request->user()->favorites()->where('property_id', $this->id)->exists()
                : false, // only true if logged in user has favorited this property
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
