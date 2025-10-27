<?php

use Illuminate\Http\Request;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\PropertyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Profile route (protected)
Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
    return response()->json([
        'message' => 'Profile loaded successfully',
        'user'    => $request->user(),
    ]);
});

// Property routes
Route::get('/properties/trending', [PropertyController::class, 'trending']);

// Admin moderation routes (require auth + admin)

Route::middleware(['auth:sanctum', EnsureAdmin::class])->group(function () {
    Route::get('/admin/properties/pending', [PropertyController::class, 'pending']);
    Route::post('/admin/properties/{property}/approve', [PropertyController::class, 'approve']);
    Route::post('/admin/properties/{property}/reject', [PropertyController::class, 'reject']);
});

// Public (browse & view)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);
Route::get('/properties/related/{property}', [PropertyController::class, 'related']);

// Protected (create, update, delete, my listings)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);
    Route::post('/properties/{property}/update-with-images', [PropertyController::class, 'updateWithImages']);
});

// Favorites
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{property}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{property}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
});

// Reviews
Route::get('/properties/{property}/reviews', [ReviewController::class, 'index']);
Route::middleware('auth:sanctum')->post('/properties/{property}/reviews', [ReviewController::class, 'store']);

// Contact
Route::post('/properties/{property}/contact', [ContactController::class, 'store'])->middleware('auth:sanctum');

// Messages
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages/inbox', [MessagesController::class, 'inbox']);
    Route::get('/messages/sent', [MessagesController::class, 'sent']);
    Route::post('/properties/{property}/contact', [MessagesController::class, 'store']);
    Route::post('/messages/{message}/reply', [MessagesController::class, 'reply']);
    Route::get('/properties/{property}/messages/{user}', [MessagesController::class, 'thread']);
});

// Categories
Route::get('/categories', [CategoryController::class, 'index']);

// Blogs
Route::get('/blogs', [BlogController::class, 'index']);
Route::post('/blogs', [BlogController::class, 'store'])->middleware('auth:sanctum');
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::put('/blogs/{id}', [BlogController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->middleware('auth:sanctum');

// Test & utility
Route::get('/test', fn() => response()->json(['message' => 'Backend is working fine 🚀']));
Route::get('/', fn() => response()->json(['message' => 'Welcome to the Backend API 🚀', 'status' => 'online']));
Route::get('/ping', fn() => response()->json(['message' => 'pong']));
Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

// Agents
Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/{id}', [AgentController::class, 'show']);

// User profile routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [UserController::class, 'showProfile']);
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/profile/password', [UserController::class, 'updatePassword']);
    Route::get('/properties/{property}/messages/{user}', [MessagesController::class, 'thread']);
});

Route::get('/users/{id}', function($id) {
    return response()->json(['user' => \App\Models\User::findOrFail($id)]);
});