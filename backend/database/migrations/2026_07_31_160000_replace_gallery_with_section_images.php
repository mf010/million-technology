<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('previous_projects', function (Blueprint $table) {
            $table->dropColumn('gallery_images');
            $table->string('description_image')->nullable()->after('description_ar');
            $table->string('challenge_image')->nullable()->after('challenge_ar');
            $table->string('solution_image')->nullable()->after('solution_ar');
            $table->string('results_image')->nullable()->after('results_ar');
        });
    }

    public function down(): void
    {
        Schema::table('previous_projects', function (Blueprint $table) {
            $table->dropColumn(['description_image', 'challenge_image', 'solution_image', 'results_image']);
            $table->json('gallery_images')->nullable()->after('cover_image');
        });
    }
};
