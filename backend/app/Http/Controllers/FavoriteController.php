<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;

class FavoriteController extends Controller
{
    /**
     * Add a property to favorites
     */
    public function store(Request $request, Property $property)
    {
        $request->user()->favorites()->syncWithoutDetaching([$property->id]);

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
