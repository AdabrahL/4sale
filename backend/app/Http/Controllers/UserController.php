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
}