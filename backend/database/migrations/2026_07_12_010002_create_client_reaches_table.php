<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('client_reaches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone_number')->nullable();
            $table->string('company_name')->nullable();
            $table->string('subject');
            $table->enum('message_type', [
                'request',
                'question',
                'partnership',
                'complaint',
                'other',
            ]);
            $table->text('message');
            $table->enum('status', ['new', 'in-progress', 'resolved', 'archived'])->default('new');
            $table->text('internal_notes')->nullable();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_reaches');
    }
};
