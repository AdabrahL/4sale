<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\PropertyResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Notifications\PropertySubmitted;
use App\Notifications\PropertyApproved;
use App\Notifications\PropertyRejected;

class PropertyController extends Controller
{
    // Public listing: only approved properties are shown
    public function index(Request $request)
    {
        $query = Property::with('user')->where('is_approved', true);

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

        $query->orderBy('id', 'desc');

        return PropertyResource::collection($query->get());
    }

    // Show a single property (increment views).
    // Allow admins and owners to view unapproved posts; public requires approval
    public function show(Request $request, Property $property)
    {
        $user = $request->user();

        if (! $property->is_approved) {
            if (! $user || (! $user->is_admin && $user->id !== $property->user_id)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This property is pending approval.'
                ], 403);
            }
        }

        $property->increment('views');

        return new PropertyResource($property->load('user'));
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

    // Store a new property (auth required) — saved as pending (is_approved = false)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
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
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5048',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $imagePaths[] = $path;
            }
        }

        $property = Property::create(array_merge($validator->validated(), [
            'user_id' => $request->user()->id,
            'images' => json_encode($imagePaths),
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => null,
        ]));

        // Notify all admins that a property has been submitted
        $admins = User::where('is_admin', true)->get();
        foreach ($admins as $admin) {
            try {
                $admin->notify(new PropertySubmitted($property));
            } catch (\Throwable $e) {
                // fail silently for notification errors
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property submitted for review. It will be visible after admin approval.',
            'property' => new PropertyResource($property->load('user')),
        ], 201);
    }

    // Update a property (owner or admin)
    public function update(Request $request, Property $property)
    {
        if ($property->user_id !== $request->user()->id && ! $request->user()->is_admin) {
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
            if ($property->images) {
                $oldImages = is_string($property->images) ? json_decode($property->images, true) : $property->images;
                foreach ($oldImages as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('properties', 'public');
                $imagePaths[] = $path;
            }
            $data['images'] = json_encode($imagePaths);
        }

        // If a non-admin edits a previously approved property, set it back to pending
        if (! $request->user()->is_admin) {
            $data['is_approved'] = false;
            $data['approved_at'] = null;
            $data['approved_by'] = null;
            $data['rejection_reason'] = null;
        }

        $property->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Property updated successfully',
            'property' => new PropertyResource($property->load('user'))
        ]);
    }

    // Delete a property (owner or admin)
    public function destroy(Request $request, Property $property)
    {
        if ($property->user_id !== $request->user()->id && ! $request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

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

    // Admin: list pending properties for review
    public function pending(Request $request)
    {
        $properties = Property::with('user')
            ->where('is_approved', false)
            ->orderByDesc('created_at')
            ->get();

        return PropertyResource::collection($properties)->additional([
            'status' => 'success',
            'message' => 'Pending properties fetched successfully',
        ]);
    }

    /**
     * Admin: approve a property (records approved_by & approved_at)
     */
     public function approve(Request $request, Property $property)
    {
        $approver = $request->user();

        // Set fields directly to avoid mass-assignment issues
        $property->is_approved    = true;
        $property->approved_at    = now();
        $property->approved_by    = $approver ? $approver->id : null;
        $property->rejection_reason = null;

        // Save and check result
        if (! $property->save()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save approval status.'
            ], 500);
        }

        // Notify owner (fail silently)
        try {
            $property->user->notify(new \App\Notifications\PropertyApproved($property));
        } catch (\Throwable $e) {
            // log it optionally: \Log::error('Notify owner failed: '.$e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property approved and is now publicly visible',
            'property' => new PropertyResource($property->fresh('user')),
        ]);
    }

    /**
     * Admin: reject a property (store rejection reason and notify owner)
     */
    public function reject(Request $request, Property $property)
    {
        $request->validate([
            'reason' => 'nullable|string|max:2000',
        ]);

        $reason = $request->input('reason');

        $property->update([
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
            'rejection_reason' => $reason,
        ]);

        // Notify owner with reason
        try {
            $property->user->notify(new PropertyRejected($property, $reason));
        } catch (\Throwable $e) {
            // ignore notification errors
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property marked as not approved (rejected)',
            'property' => new PropertyResource($property->fresh('user')),
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
            return $score >= 2;
        })->take(4);

        return PropertyResource::collection($related)->additional([
            'status' => 'success',
            'message' => 'Related properties fetched successfully',
        ]);
    }

    public function updateWithImages(Request $request, Property $property)
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'property_type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'location' => 'sometimes|string',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'size' => 'nullable|numeric',
            'images' => 'nullable', // images to keep (JSON array of filenames)
            'new_images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $imagesToKeep = [];
        if ($request->filled('images')) {
            $imagesToKeep = json_decode($request->input('images'), true) ?? [];
        }

        $newImagePaths = [];
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $image) {
                $path = $image->store('properties', 'public');
                $newImagePaths[] = $path;
            }
        }

        $oldImages = is_string($property->images) ? json_decode($property->images, true) : ($property->images ?? []);
        foreach ($oldImages as $img) {
            if (!in_array($img, $imagesToKeep)) {
                Storage::disk('public')->delete($img);
            }
        }

        $finalImages = array_merge($imagesToKeep, $newImagePaths);

        $property->update(array_merge(
            $validated,
            ['images' => json_encode($finalImages)]
        ));

        return response()->json([
            'status' => 'success',
            'message' => 'Property updated, images synced!',
            'property' => new \App\Http\Resources\PropertyResource($property->fresh('user'))
        ]);
    }

    // Return trending properties by views (top 5)
    public function trending()
    {
        $properties = Property::with('user')
            ->where('is_approved', true)
            ->orderByDesc('views')
            ->take(5)
            ->get();

        return PropertyResource::collection($properties);
    }
}