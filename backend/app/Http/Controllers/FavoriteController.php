<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;

class FavoriteController extends Controller
{
    // Add to favorites
    public function store(Request $request, Property $property)
    {
        $request->user()->favorites()->firstOrCreate([
            'property_id' => $property->id,
        ]);

        return response()->json(['message' => 'Property added to favorites']);
    }

    // Remove from favorites
    public function destroy(Request $request, Property $property)
    {
        $request->user()->favorites()->where('property_id', $property->id)->delete();

        return response()->json(['message' => 'Property removed from favorites']);
    }

    // List user’s favorites
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('property')
            ->get()
            ->pluck('property'); // extract only the property objects

        return PropertyResource::collection($favorites)
            ->additional([
                'status' => 'success',
                'message' => 'Favorites fetched successfully',
            ]);
    }
}
