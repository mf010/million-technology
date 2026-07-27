<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'mohammedfurrara1@gmail.com'],
            [
                'name' => 'mohammed',
                'password' => 'password', // Automatically hashed by the User model's 'password' => 'hashed' cast
            ]
        );
    }
}
