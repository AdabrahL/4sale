<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Message;


class ContactController extends Controller
{
    /**
     * Send a message to the seller/agent of a property
     */
    public function store(Request $request, Property $property)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

Message::create([
    'property_id' => $property->id,
    'user_id' => $request->user()->id,
    'message' => $validated['message'],
]);

        $user = $property->user;

        // You can save the message to DB, or send via email (basic example below)
        Mail::raw($validated['message'], function ($mail) use ($user, $request, $property) {
            $mail->to($user->email)
                ->subject("New inquiry about your property: {$property->title}")
                ->replyTo($request->user()->email ?? 'noreply@forsale.com');
        });

        // Optionally, save to messages table (not included here for brevity)

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent to seller/agent',
        ]);
    }
}