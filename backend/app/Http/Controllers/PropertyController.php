<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    // List all properties with filters, search, pagination and user info
public function index(Request $request)
{
    $query = Property::with('user');

    if ($request->filled('location')) {
        $query->where('location', 'like', "%{$request->location}%");
    }

    if ($request->filled('property_type')) {
        $query->where('property_type', $request->property_type);
    }
if ($request->filled('status')) {
    $query->where('status', $request->status);
}

    if ($request->filled('min_price')) {
        $query->where('price', '>=', (int) $request->min_price);
    }

    if ($request->filled('max_price')) {
        $query->where('price', '<=', (int) $request->max_price);
    }

    // Order by newest first
    $query->orderBy('id', 'desc');

    // Get all results (no pagination)
    return PropertyResource::collection(
        $query->get()
    );
}
    // Show a single property
    public function show(Property $property)
    {
        return new PropertyResource($property->load('user')); // also load user
    }

    // Show only logged-in user’s properties (with pagination + user)
    public function myProperties(Request $request)
    {
        $user = $request->user();

        $perPage = $request->get('per_page', 10);
        $properties = $user->properties()
            ->with('user')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'My Listings fetched successfully',
            'data' => $properties
        ]);
    }

    // Store a new property (auth required)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'property_type' => 'required|string',
            'status' => 'required|in:for_sale,for_rent,lease',
            'location' => 'required|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'size' => 'nullable|numeric',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $imagePaths[] = $path;
            }
        }

        $property = Property::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'images' => json_encode($imagePaths),
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Property created successfully',
            'property' => new PropertyResource($property->load('user')),
        ], 201);
    }

    // Update a property (only owner)
    public function update(Request $request, Property $property)
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'property_type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'location' => 'sometimes|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'size' => 'nullable|numeric',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->except('images');

        if ($request->hasFile('images')) {
            // Delete old images if they exist
            if ($property->images) {
                $oldImages = is_string($property->images) ? json_decode($property->images, true) : $property->images;
                foreach ($oldImages as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            // Save new images
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $imagePaths[] = $path;
            }
            $data['images'] = json_encode($imagePaths);
        }

        $property->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Property updated successfully',
            'property' => new PropertyResource($property->load('user'))
        ]);
    }

    // Delete a property (only owner)
    public function destroy(Request $request, Property $property)
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete property images from storage
        if ($property->images) {
            $images = is_string($property->images) ? json_decode($property->images, true) : $property->images;
            foreach ($images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $property->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Property and its images deleted successfully'
        ]);
    }

    

   public function related(Property $property)
{
    $results = Property::where('id', '!=', $property->id)
        ->get();

    $related = $results->filter(function($item) use ($property) {
        $score = 0;
        if ($item->category_id == $property->category_id) $score++;
        if ($item->location == $property->location) $score++;
        if ($item->property_type == $property->property_type) $score++;
        if ($item->bedrooms == $property->bedrooms) $score++;
        // add other fields if desired
        return $score >= 2;
    })->take(4);

    return PropertyResource::collection($related)->additional([
        'status' => 'success',
        'message' => 'Related properties fetched successfully',
    ]);
}
}
