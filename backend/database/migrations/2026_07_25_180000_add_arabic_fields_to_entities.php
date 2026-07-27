<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add nullable Arabic (_ar) translation columns to content entities.
     */
    public function up(): void
    {
        // ── Client Statements ─────────────────────────────────────────────
        Schema::table('client_statements', function (Blueprint $table) {
            $table->string('client_name_ar')->nullable()->after('client_name');
            $table->string('client_position_ar')->nullable()->after('client_position');
            $table->string('company_name_ar')->nullable()->after('company_name');
            $table->text('statement_ar')->nullable()->after('statement');
        });

        // ── Job Openings ──────────────────────────────────────────────────
        Schema::table('job_openings', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->string('department_ar')->nullable()->after('department');
            $table->string('location_ar')->nullable()->after('location');
            $table->string('employment_type_ar')->nullable()->after('employment_type');
            $table->string('workplace_type_ar')->nullable()->after('workplace_type');
            $table->text('summary_ar')->nullable()->after('summary');
            $table->longText('description_ar')->nullable()->after('description');
            $table->longText('responsibilities_ar')->nullable()->after('responsibilities');
            $table->longText('requirements_ar')->nullable()->after('requirements');
        });

        // ── Our Clients ───────────────────────────────────────────────────
        Schema::table('our_clients', function (Blueprint $table) {
            $table->text('description_ar')->nullable()->after('description');
        });

        // ── Posts ─────────────────────────────────────────────────────────
        Schema::table('posts', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->text('excerpt_ar')->nullable()->after('excerpt');
            $table->longText('content_ar')->nullable()->after('content');
        });

        // ── Previous Projects ─────────────────────────────────────────────
        Schema::table('previous_projects', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->string('client_display_name_ar')->nullable()->after('client_display_name');
            $table->text('short_description_ar')->nullable()->after('short_description');
            $table->longText('description_ar')->nullable()->after('description');
            $table->longText('challenge_ar')->nullable()->after('challenge');
            $table->longText('solution_ar')->nullable()->after('solution');
            $table->longText('results_ar')->nullable()->after('results');
            $table->json('technologies_ar')->nullable()->after('technologies');
        });

        // ── Services ──────────────────────────────────────────────────────
        Schema::table('services', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->text('short_description_ar')->nullable()->after('short_description');
            $table->longText('description_ar')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('client_statements', function (Blueprint $table) {
            $table->dropColumn(['client_name_ar', 'client_position_ar', 'company_name_ar', 'statement_ar']);
        });

        Schema::table('job_openings', function (Blueprint $table) {
            $table->dropColumn([
                'title_ar', 'department_ar', 'location_ar',
                'employment_type_ar', 'workplace_type_ar',
                'summary_ar', 'description_ar',
                'responsibilities_ar', 'requirements_ar',
            ]);
        });

        Schema::table('our_clients', function (Blueprint $table) {
            $table->dropColumn(['description_ar']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['title_ar', 'excerpt_ar', 'content_ar']);
        });

        Schema::table('previous_projects', function (Blueprint $table) {
            $table->dropColumn([
                'title_ar', 'client_display_name_ar', 'short_description_ar',
                'description_ar', 'challenge_ar', 'solution_ar',
                'results_ar', 'technologies_ar',
            ]);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['title_ar', 'short_description_ar', 'description_ar']);
        });
    }
};
