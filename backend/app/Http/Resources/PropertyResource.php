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

        // Convert relative storage paths into full URLs (safe)
        $imageUrls = array_map(function ($path) {
            if (! $path) {
                return null;
            }

            // Storage::url returns e.g. /storage/properties/xxx.jpg or a full URL depending on driver
            $storageUrl = Storage::url($path);

            // Use asset(...) to ensure full absolute URL is returned
            return asset($storageUrl);
        }, $images);

        // Compute review aggregates safely
        $average = (float) ($this->reviews()->avg('rating') ?? 0);
        $average = $average ? round($average, 1) : 0.0;
        $reviewCount = (int) $this->reviews()->count();

        // Determine favorite status (if user provided)
        $isFavorited = false;
        if ($request->user()) {
            try {
                $isFavorited = (bool) $request->user()->favorites()->where('property_id', $this->id)->exists();
            } catch (\Throwable $e) {
                $isFavorited = false;
            }
        }

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
            'images'        => array_values(array_filter($imageUrls)), // remove nulls and reindex
            'user_id'       => $this->user_id,
            'views'         => (int) $this->views,

            // Favorites check
            'is_favorited'  => $isFavorited,

            // Reviews summary
            'average_rating'=> $average,
            'review_count'  => $reviewCount,

            // Timestamps
            'created_at'    => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at'    => $this->updated_at ? $this->updated_at->toDateTimeString() : null,

            // approval info (expects properties table to have these columns)
            'is_approved'   => (bool) $this->is_approved,
            'approved_at'   => $this->approved_at ? $this->approved_at->toDateTimeString() : null,
            'approved_by'   => $this->approved_by ? $this->approved_by : null,

            // Include owner info when loaded
            'user' => $this->whenLoaded('user', function () {
                return new \App\Http\Resources\UserResource($this->user);
            }),
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