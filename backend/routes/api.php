<?php 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\PropertyController;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'Backend is working fine 🚀']);
});

// Default welcome route
Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to the Backend API 🚀',
        'status' => 'online'
    ]);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Profile route (protected)
Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
    return response()->json([
        'message' => 'Profile loaded successfully',
        'user' => $request->user()
    ]);
});

// Property routes
// Public (browse & view)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

// Protected (create, update, delete)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
});

// Property CRUD routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('properties', PropertyController::class);

    // My Listings
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);
});

//Add To Favorite
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/favorites/{property}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{property}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
});

//Revievs
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/properties/{property}/reviews', [ReviewController::class, 'store']);
});
Route::get('/properties/{property}/reviews', [ReviewController::class, 'index']);
