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

        // Convert relative paths into FULL URLs
        $imageUrls = array_map(function ($path) {
            return asset(Storage::url($path)); 
            // e.g. http://backend.test/storage/properties/filename.jpg
        }, $images);

        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'category_id'   => $this->category_id,
            'category_name' => $this->category ? $this->category->name : null,
            'description'   => $this->description,
            'price'         => $this->price,
            'property_type' => $this->property_type,
            'status'        => $this->status,
            'location'      => $this->location,
            'bedrooms'      => $this->bedrooms,
            'bathrooms'     => $this->bathrooms,
            'size'          => $this->size,
            'images'        => $imageUrls,
            'user_id'       => $this->user_id,

            // Favorites check
            'is_favorited'  => $request->user()
                ? $request->user()->favorites()->where('property_id', $this->id)->exists()
                : false,

            // Reviews summary
            'average_rating'=> round($this->reviews()->avg('rating'), 1) ?? 0,
            'review_count'  => $this->reviews()->count(),

            'created_at'    => $this->created_at->toDateTimeString(),
            'updated_at'    => $this->updated_at->toDateTimeString(),
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
