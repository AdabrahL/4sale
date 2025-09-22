<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    // List all properties with filters, search, and pagination
    public function index(Request $request)
    {
        $query = Property::query();

        // Filtering
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Pagination (default 10 per page, can be changed with ?per_page=20)
        $perPage = $request->get('per_page', 10);
        $properties = $query->paginate($perPage);

        return PropertyResource::collection($properties)
            ->additional([
                'status' => 'success',
                'filters' => $request->all(),
            ]);
    }

    // Show a single property
    public function show(Property $property)
    {
        return new PropertyResource($property);
    }

    // Show only logged-in user’s properties
    public function myProperties(Request $request)
    {
        $properties = Property::where('user_id', $request->user()->id)->paginate(10);

        return PropertyResource::collection($properties)
            ->additional([
                'status' => 'success',
                'message' => 'My Listings fetched successfully',
            ]);
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
            'status' => 'success',
            'message' => 'Property created successfully',
            'property' => new PropertyResource($property),
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
            'property' => new PropertyResource($property)
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
}
