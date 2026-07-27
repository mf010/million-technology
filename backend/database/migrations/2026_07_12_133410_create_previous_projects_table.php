<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('previous_projects', function (Blueprint $table) {
            $table->id();
            // Nullable FK — set to null when client is soft-deleted (historical record preserved)
            $table->foreignId('our_client_id')
                  ->nullable()
                  ->constrained('our_clients')
                  ->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client_display_name')->nullable();  // shown when no linked client
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('challenge')->nullable();
            $table->longText('solution')->nullable();
            $table->longText('results')->nullable();
            $table->json('technologies')->nullable();           // array of technology strings
            $table->string('cover_image')->nullable();
            $table->json('gallery_images')->nullable();         // array of stored paths
            $table->string('project_url')->nullable();
            $table->date('completed_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('previous_projects');
    }
};
