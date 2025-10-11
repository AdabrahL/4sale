<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Notifications\NewMessageNotification;

class MessagesController extends Controller
{
    // Get all messages (inbox) for authenticated user
    public function inbox(Request $request)
    {
        $user = $request->user();
        $messages = Message::where('receiver_id', $user->id)
            ->with(['property', 'sender'])
            ->orderBy('created_at', 'desc')
            ->get();

        return MessageResource::collection($messages);
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

    // Send a new message (buyer to agent)
    public function store(Request $request, $property_id)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'reply_to' => 'nullable|integer|exists:messages,id'
        ]);
        $user = $request->user();
        $property = \App\Models\Property::findOrFail($property_id);
        $receiver_id = $property->user_id;

        $msg = Message::create([
            'property_id' => $property->id,
            'sender_id' => $user->id,
            'receiver_id' => $receiver_id,
            'message' => $validated['message'],
            'reply_to' => $validated['reply_to'] ?? null,
        ]);

        // Optionally trigger notification/email here

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
// In store/reply methods after Message::create
$receiver = User::find($receiver_id);
$receiver->notify(new NewMessageNotification($msg));
        // Optionally trigger notification/email here

        return new MessageResource($msg);
    }

    public function thread($property_id, $user_id)
{
    // Show all messages between property owner and a user for a property
    $property = Property::findOrFail($property_id);

    $messages = Message::where('property_id', $property_id)
        ->where(function ($q) use ($user_id, $property) {
            $q->where('sender_id', $user_id)->where('receiver_id', $property->user_id)
              ->orWhere('sender_id', $property->user_id)->where('receiver_id', $user_id);
        })
        ->orderBy('created_at')
        ->with(['sender', 'receiver', 'property'])
        ->get();

    return MessageResource::collection($messages);
}
}