<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // ──────────────────────────────────────────────
    //  Register a new user
    // ──────────────────────────────────────────────

    /**
     * POST /api/auth/register
     * Register a new user and return a JWT token.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password, // auto-hashed via model cast
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully.',
            'user'    => $user,
            'token'   => $token,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60, // seconds
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  Login
    // ──────────────────────────────────────────────

    /**
     * POST /api/auth/login
     * Authenticate with email & password and return a JWT token.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password.',
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token. Please try again.',
            ], 500);
        }

        return response()->json([
            'success'    => true,
            'message'    => 'Login successful.',
            'token'      => $token,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    // ──────────────────────────────────────────────
    //  Logout
    // ──────────────────────────────────────────────

    /**
     * POST /api/auth/logout
     * Invalidate the current JWT token.
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to invalidate token.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    //  Get Authenticated User
    // ──────────────────────────────────────────────

    /**
     * GET /api/auth/me
     * Return the currently authenticated user's profile.
     */
    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user'    => auth('api')->user(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  Change Password
    // ──────────────────────────────────────────────

    /**
     * PUT /api/auth/change-password
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        /** @var User $user */
        $user = auth('api')->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update(['password' => $request->new_password]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    //  Delete Account
    // ──────────────────────────────────────────────

    /**
     * DELETE /api/auth/delete
     * Delete the authenticated user's account.
     */
    public function deleteAccount(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException) {
            // Token invalidation failure is non-critical here
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ]);
    }

    // ──────────────────────────────────────────────
    //  List All Users
    // ──────────────────────────────────────────────

    /**
     * GET /api/auth/users
     * Return list of all registered users.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'users'   => User::orderBy('name')->get(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  Delete Specific User
    // ──────────────────────────────────────────────

    /**
     * DELETE /api/auth/users/{id}
     * Delete a specific user by ID.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        // Prevent self-deletion via this endpoint if needed, or allow it
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
