<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // Get current user's profile
    public function showProfile(Request $request)
    {
        $user = Auth::user();
        return response()->json(['user' => $user]);
    }

    // Update profile for logged-in user
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        // Validate request
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:40',
            'bio' => 'nullable|string|max:300',
            'socials' => 'nullable',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('avatars', 'public');
        }

        // Handle socials (JSON)
        if (isset($data['socials'])) {
            if (is_string($data['socials'])) {
                $data['socials'] = json_decode($data['socials'], true);
            }
        }

        $user->update($data);

        return response()->json(['user' => $user]);
    }

    // Optionally: Change password
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user->password = bcrypt($data['password']);
        $user->save();
        return response()->json(['message' => 'Password updated successfully.']);
    }

    // Admin: Get all users
    public function getAllUsers(Request $request)
    {
        // Ensure user is admin
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::orderBy('created_at', 'desc')->get();
        
        return response()->json(['users' => $users]);
    }

    // Admin: Update user role
    public function updateUserRole(Request $request, $id)
    {
        // Ensure user is admin
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'is_admin' => 'required|boolean',
            'is_agent' => 'required|boolean',
        ]);

        $targetUser = User::findOrFail($id);

        // Prevent demoting yourself
        if ($targetUser->id === $request->user()->id) {
            return response()->json(['error' => 'You cannot change your own role'], 400);
        }

        $targetUser->update([
            'is_admin' => $data['is_admin'],
            'is_agent' => $data['is_agent'],
        ]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $targetUser
        ]);
    }

    // Admin: Delete user
    public function deleteUser(Request $request, $id)
    {
        // Ensure user is admin
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $targetUser = User::findOrFail($id);

        // Prevent deleting yourself
        if ($targetUser->id === $request->user()->id) {
            return response()->json(['error' => 'You cannot delete your own account'], 400);
        }

        // Delete user's photo if exists
        if ($targetUser->photo && Storage::disk('public')->exists($targetUser->photo)) {
            Storage::disk('public')->delete($targetUser->photo);
        }

        $targetUser->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    // Admin: Get user details
    public function getUserDetails(Request $request, $id)
    {
        // Ensure user is admin
        if (!$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $targetUser = User::with(['properties', 'favorites'])->findOrFail($id);

        return response()->json(['user' => $targetUser]);
    }
}