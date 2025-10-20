<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    // List all agents (users with >= 5 properties)
    public function index()
{
    $agents = \App\Models\User::with('properties')
        ->withCount('properties')
        ->get()
        ->filter(function($user) {
            return $user->properties_count >= 5;
        })
        ->values(); // re-index

    return response()->json($agents);
}
    // Get a single agent and their properties
    public function show($id)
    {
        $agent = User::with(['properties'])->findOrFail($id);

        if ($agent->properties->count() < 5) {
            return response()->json(['error' => 'Not an agent'], 404);
        }

        return response()->json($agent);
    }
}