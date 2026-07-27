<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Safely check if the current request is made by an authenticated admin.
     * This prevents exceptions from being thrown on public routes if an invalid/expired token is provided.
     *
     * @return bool
     */
    protected function isAdmin(): bool
    {
        try {
            if (request()->bearerToken()) {
                return auth('api')->check();
            }
        } catch (\Exception $e) {
            // Ignore token exceptions on public endpoints
        }

        return false;
    }
}
