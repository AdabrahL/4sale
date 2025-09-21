<?php

namespace App\Http\Controllers;


use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    // List all properties
    public function index()
    {
        $properties = Property::all();

        return response()->json([
            'status' => 'success',
            'count' => $properties->count(),
            'data' => PropertyResource::collection($properties),
        ]);
    }

    // Show a single property
    public function show(Property $property)
    {
        return new PropertyResource($property);
    }

    // Store a new property (auth required)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'property_type' => 'required|string',
            'status' => 'required|string',
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
            'message' => 'Property created successfully',
            'property' => new PropertyResource($property),
        ], 201);
    }

    // Update a property
    public function update(Request $request, Property $property)
    {
    $request->validate([
        'title' => 'sometimes|string|max:255',
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
        'message' => 'Property updated successfully',
        'property' => new \App\Http\Resources\PropertyResource($property)
    ]);
}

  // Delete a property
public function destroy(Property $property)
{
    // Delete property images from storage
    if ($property->images) {
        $images = is_string($property->images) ? json_decode($property->images, true) : $property->images;
        foreach ($images as $image) {
            Storage::disk('public')->delete($image);
        }
    }

    $property->delete();

    return response()->json([
        'message' => 'Property and its images deleted successfully'
    ]);
}

}
