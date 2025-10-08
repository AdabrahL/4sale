<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PropertyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========================
// 🛠 Test & Utility routes
// ========================
Route::get('/test', fn() => response()->json(['message' => 'Backend is working fine 🚀']));
Route::get('/', fn() => response()->json(['message' => 'Welcome to the Backend API 🚀', 'status' => 'online']));
Route::get('/ping', fn() => response()->json(['message' => 'pong']));
Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

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

// Public (browse & view)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

// Protected (create, update, delete, my listings)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    // ✅ My Properties endpoint (clean, no conflicts)
    //Route::get('/my-properties', [PropertyController::class, 'myProperties']);
    Route::middleware('auth:sanctum')->get('/my-properties', [PropertyController::class, 'myProperties']);
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
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties/{property}/reviews', [ReviewController::class, 'store']);
});
Route::get('/properties/{property}/reviews', [ReviewController::class, 'index']);

// ========================
// 📝 Contact routes
// ========================
Route::post('/properties/{property}/contact', [ContactController::class, 'store'])->middleware('auth:sanctum');
Route::get('/properties/related/{property}', [PropertyController::class, 'related']);