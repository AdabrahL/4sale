<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\ReviewResource;

class ReviewController extends Controller
{
    /**
     * Add a review
     */
    public function store(Request $request, Property $property)
    {
        $validated = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = Review::create([
            'user_id'     => $request->user()->id,
            'property_id' => $property->id,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Review added successfully',
            'data'    => new ReviewResource($review), // ✅ wrap in resource
        ]);
    }

    /**
     * List reviews for a property
     */
    public function index(Property $property)
    {
        $reviews = $property->reviews()->with('user')->latest()->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Reviews fetched successfully',
            'data'    => ReviewResource::collection($reviews), // ✅ wrap collection
        ]);
    }
}
