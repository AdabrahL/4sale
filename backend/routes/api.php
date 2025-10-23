<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========================
// 🔐 Authentication routes
// ========================
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

// ========================
// 🏡 Property routes
// ========================
Route::get('/properties/trending', [PropertyController::class, 'trending']);
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

// ========================
// ⭐ Favorites routes
// ========================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{property}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{property}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
});

// ========================
// 📝 Reviews routes
// ========================
// Public: get reviews
Route::get('/properties/{property}/reviews', [ReviewController::class, 'index']);
// Protected: add reviews
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties/{property}/reviews', [ReviewController::class, 'store']);
});

// ========================
// 📝 Contact routes
// ========================
Route::post('/properties/{property}/contact', [ContactController::class, 'store'])->middleware('auth:sanctum');

// ========================
// ✉️ Messages routes
// ========================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages/inbox', [MessagesController::class, 'inbox']);
    Route::get('/messages/sent', [MessagesController::class, 'sent']);
    Route::post('/properties/{property}/contact', [MessagesController::class, 'store']);
    Route::post('/messages/{message}/reply', [MessagesController::class, 'reply']);
    Route::get('/properties/{property}/messages/{user}', [MessagesController::class, 'thread']);
    
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

// ========================
// Blogs Routes
// ========================
Route::get('/blogs', [BlogController::class, 'index']);
Route::post('/blogs', [BlogController::class, 'store'])->middleware('auth:sanctum');
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::put('/blogs/{id}', [BlogController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->middleware('auth:sanctum');

// ========================
// 🛠️ Test & Utility routes
// ========================
Route::get('/test', fn() => response()->json(['message' => 'Backend is working fine 🚀']));
Route::get('/', fn() => response()->json(['message' => 'Welcome to the Backend API 🚀', 'status' => 'online']));
Route::get('/ping', fn() => response()->json(['message' => 'pong']));
Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

// ========================
// Agents Routes
// ========================
Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/{id}', [AgentController::class, 'show']);


// ========================
// User Profile Routes      
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [UserController::class, 'showProfile']);
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
    Route::post('/profile/password', [UserController::class, 'updatePassword']);

    Route::middleware('auth:sanctum')->get('/properties/{property}/messages/{user}', [MessagesController::class, 'thread']);
});
Route::get('/users/{id}', function($id) {
    return response()->json(['user' => \App\Models\User::findOrFail($id)]);
});

