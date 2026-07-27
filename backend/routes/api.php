<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientReachController;
use App\Http\Controllers\JobOpeningController;
use App\Http\Controllers\OurClientController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PreviousProjectController;
use App\Http\Controllers\ClientStatementController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Public auth routes (no token required) ────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Protected auth routes (JWT token required) ────────────────────────────
Route::prefix('auth')->middleware('auth:api')->group(function () {
    Route::post  ('/logout',          [AuthController::class, 'logout']);
    Route::get   ('/me',              [AuthController::class, 'me']);
    Route::put   ('/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/delete',          [AuthController::class, 'deleteAccount']);
    Route::get   ('/users',           [AuthController::class, 'index']);
    Route::delete('/users/{id}',      [AuthController::class, 'destroy']);
});

// ── Public post routes ────────────────────────────────────────────────────
Route::prefix('posts')->group(function () {
    Route::get('/',            [PostController::class, 'index']);   // List published posts
    Route::get('/{identifier}',[PostController::class, 'show']);    // Get single post by ID or slug
});

// ── Protected post routes (JWT token required) ────────────────────────────
Route::prefix('posts')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [PostController::class, 'store']);    // Create post
    Route::put   ('/{id}',[PostController::class, 'update']);  // Update post
    Route::delete('/{id}',[PostController::class, 'destroy']); // Soft-delete post
});

// ── Public job opening routes ─────────────────────────────────────────────
Route::prefix('job-openings')->group(function () {
    Route::get('/',            [JobOpeningController::class, 'index']); // List open job openings
    Route::get('/{identifier}',[JobOpeningController::class, 'show']);  // Get job opening by ID or slug
});

// ── Protected job opening routes (JWT token required) ────────────────────
Route::prefix('job-openings')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [JobOpeningController::class, 'store']);   // Create job opening
    Route::put   ('/{id}',[JobOpeningController::class, 'update']);  // Update job opening
    Route::delete('/{id}',[JobOpeningController::class, 'destroy']); // Soft-delete job opening
});

// ── Public client reach routes (rate-limited) ─────────────────────────────
Route::prefix('client-reach')->middleware('throttle:30,1')->group(function () {
    Route::post('/', [ClientReachController::class, 'store']); // Submit client message
});

// ── Protected client reach routes (JWT token required) ───────────────────
Route::prefix('client-reach')->middleware('auth:api')->group(function () {
    Route::get   ('/',    [ClientReachController::class, 'index']);   // List messages
    Route::get   ('/{id}',[ClientReachController::class, 'show']);    // Get single message
    Route::put   ('/{id}',[ClientReachController::class, 'update']);  // Update status / notes
    Route::delete('/{id}',[ClientReachController::class, 'destroy']); // Soft-delete
});

// ── Public service routes ─────────────────────────────────────────
Route::prefix('services')->group(function () {
    Route::get('/',            [ServiceController::class, 'index']); // List active services
    Route::get('/{identifier}',[ServiceController::class, 'show']);  // Get service by ID or slug
});

// ── Protected service routes (JWT token required) ──────────────────────
Route::prefix('services')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [ServiceController::class, 'store']);   // Create service
    Route::put   ('/{id}',[ServiceController::class, 'update']);  // Update service
    Route::delete('/{id}',[ServiceController::class, 'destroy']); // Soft-delete service
});

// ── Public our-clients routes ────────────────────────────────────────
Route::prefix('our-clients')->group(function () {
    Route::get('/',    [OurClientController::class, 'index']); // List active clients
    Route::get('/{id}',[OurClientController::class, 'show']);  // Get client by ID
});

// ── Protected our-clients routes (JWT token required) ─────────────────────
Route::prefix('our-clients')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [OurClientController::class, 'store']);   // Create client
    Route::put   ('/{id}',[OurClientController::class, 'update']);  // Update client
    Route::delete('/{id}',[OurClientController::class, 'destroy']); // Soft-delete client
});

// ── Public previous-projects routes ─────────────────────────────────
Route::prefix('previous-projects')->group(function () {
    Route::get('/',            [PreviousProjectController::class, 'index']); // List published projects
    Route::get('/{identifier}',[PreviousProjectController::class, 'show']);  // Get project by ID or slug
});

// ── Protected previous-projects routes (JWT token required) ────────────────
Route::prefix('previous-projects')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [PreviousProjectController::class, 'store']);   // Create project
    Route::put   ('/{id}',[PreviousProjectController::class, 'update']);  // Update project
    Route::delete('/{id}',[PreviousProjectController::class, 'destroy']); // Soft-delete project
});

// ── Public client-statements routes ───────────────────────────────────
Route::prefix('client-statements')->group(function () {
    Route::get('/',    [ClientStatementController::class, 'index']); // List published statements
    Route::get('/{id}',[ClientStatementController::class, 'show']);  // Get statement by ID
});

// ── Protected client-statements routes (JWT token required) ────────────────
Route::prefix('client-statements')->middleware('auth:api')->group(function () {
    Route::post  ('/',    [ClientStatementController::class, 'store']);   // Create statement
    Route::put   ('/{id}',[ClientStatementController::class, 'update']);  // Update statement
    Route::delete('/{id}',[ClientStatementController::class, 'destroy']); // Soft-delete statement
});
