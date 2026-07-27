<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_statements', function (Blueprint $table) {
            $table->id();
            // Nullable FK — set to null when the linked client is soft-deleted
            $table->foreignId('our_client_id')
                  ->nullable()
                  ->constrained('our_clients')
                  ->nullOnDelete();
            $table->string('client_name');
            $table->string('client_position')->nullable();
            $table->string('company_name')->nullable();      // auto-filled from linked client when omitted
            $table->text('statement');
            $table->string('client_image')->nullable();      // stored path under storage/app/public/statements/
            $table->unsignedTinyInteger('rating');           // 1–5
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_statements');
    }
};
