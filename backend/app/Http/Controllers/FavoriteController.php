<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;
use App\Services\NotificationService;

class FavoriteController extends Controller
{
    /**
     * Add a property to favorites
     */
    public function store(Request $request, Property $property)
    {
        $user = $request->user();
        $user->favorites()->syncWithoutDetaching([$property->id]);

        // Notify property owner (if not favoriting their own property)
        if ($property->user_id !== $user->id) {
            try {
                NotificationService::propertyFavorited($property, $user);
            } catch (\Throwable $e) {
                // log it optionally
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Property added to favorites',
            'data'    => new PropertyResource($property),
        ]);
    }

    /**
     * Remove a property from favorites
     */
    public function destroy(Request $request, Property $property)
    {
        $request->user()->favorites()->detach($property->id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Property removed from favorites',
            'data'    => new PropertyResource($property),
        ]);
    }

    /**
     * Get all user favorites
     */
    public function index(Request $request)
    {
        $favorites = $request->user()->favorites()->paginate(10);

        return PropertyResource::collection($favorites)
            ->additional([
                'status'  => 'success',
                'message' => 'Favorite properties fetched successfully',
            ]);
    }
}
