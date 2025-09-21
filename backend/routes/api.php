<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'Backend is working fine 🚀']);
});

// Show all properties when visiting /api
Route::get('/', [PropertyController::class, 'index']);


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

// Property CRUD routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('properties', PropertyController::class);
});
