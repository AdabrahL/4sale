<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Resources\MessageResource;

class MessagesController extends Controller
{
    // Get all messages (inbox) for authenticated user
    public function inbox(Request $request)
    {
        $user = $request->user();

        $messages = Message::where(function ($q) use ($user) {
            $q->where('sender_id', $user->id)
              ->orWhere('receiver_id', $user->id);
        })
        ->with(['property', 'sender', 'receiver'])
        ->orderBy('created_at', 'desc')
        ->get();

        // Group by conversation (property_id, other_user_id)
        $conversations = [];
        foreach ($messages as $msg) {
            $otherUserId = $msg->sender_id === $user->id ? $msg->receiver_id : $msg->sender_id;
            $key = $msg->property_id . '-' . $otherUserId;
            if (!isset($conversations[$key]) || $msg->created_at > $conversations[$key]->created_at) {
                $conversations[$key] = $msg;
            }
        }

        return MessageResource::collection(array_values($conversations));
    }

    // Get all sent messages for authenticated user
    public function sent(Request $request)
    {
        $user = $request->user();
        $messages = Message::where('sender_id', $user->id)
            ->with(['property', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return MessageResource::collection($messages);
    }

    // Send a new message (client to agent)
    public function store(Request $request, $property_id)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'reply_to' => 'nullable|integer|exists:messages,id'
        ]);
        $user = $request->user();
        $property = Property::findOrFail($property_id);
        $receiver_id = $property->user_id;

        // Prevent users from messaging their own property
        if ($user->id === $property->user_id) {
            return response()->json([
                'error' => 'You cannot send a message about a property you posted.'
            ], 403);
        }

        $msg = Message::create([
            'property_id' => $property->id,
            'sender_id' => $user->id,
            'receiver_id' => $receiver_id,
            'message' => $validated['message'],
            'reply_to' => $validated['reply_to'] ?? null,
        ]);

        return new MessageResource($msg);
    }

    // Agent replies to a message (threaded)
    public function reply(Request $request, $message_id)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000'
        ]);
        $original = Message::findOrFail($message_id);
        $user = $request->user();

        // Only property owner can reply
        if ($user->id !== $original->receiver_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $msg = Message::create([
            'property_id' => $original->property_id,
            'sender_id' => $user->id,
            'receiver_id' => $original->sender_id,
            'message' => $validated['message'],
            'reply_to' => $original->id,
        ]);

        return new MessageResource($msg);
    }

    // Full conversation (thread) between the authenticated user and the other user for a property
    public function thread(Request $request, $property_id, $other_user_id)
    {
        $authUserId = $request->user()->id;

        $property = Property::findOrFail($property_id);

        // Fetch all messages between auth user and other user for this property
        $messages = Message::where('property_id', $property_id)
            ->where(function ($query) use ($authUserId, $other_user_id) {
                $query->where(function ($q) use ($authUserId, $other_user_id) {
                    $q->where('sender_id', $authUserId)
                      ->where('receiver_id', $other_user_id);
                })->orWhere(function ($q) use ($authUserId, $other_user_id) {
                    $q->where('sender_id', $other_user_id)
                      ->where('receiver_id', $authUserId);
                });
            })
            ->orderBy('created_at')
            ->with(['sender', 'receiver', 'property'])
            ->get();

        return MessageResource::collection($messages);
    }
}