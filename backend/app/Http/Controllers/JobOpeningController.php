<?php

namespace App\Http\Controllers;

use App\Models\JobOpening;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class JobOpeningController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    /**
     * Generate a unique slug from the given source string.
     * Appends a numeric suffix on conflicts, optionally excluding a specific record ID.
     */
    private function generateUniqueSlug(string $source, ?int $excludeId = null): string
    {
        $base    = Str::slug($source);
        $slug    = $base;
        $counter = 2;

        while (
            JobOpening::withTrashed()
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Shared validation rules for create / update.
     *
     * @param  bool  $required  Whether title/description/type fields are required.
     */
    private function validationRules(bool $required = true): array
    {
        $req = $required ? 'required' : 'nullable';

        return [
            'title'              => "{$req}|string|max:255",
            'title_ar'           => 'nullable|string|max:255',
            'slug'               => 'nullable|string|max:255',
            'department'         => 'nullable|string|max:255',
            'department_ar'      => 'nullable|string|max:255',
            'location'           => 'nullable|string|max:255',
            'location_ar'        => 'nullable|string|max:255',
            'employment_type'    => "{$req}|in:full-time,part-time,contract,internship,temporary",
            'employment_type_ar' => 'nullable|string|max:255',
            'workplace_type'     => "{$req}|in:on-site,remote,hybrid",
            'workplace_type_ar'  => 'nullable|string|max:255',
            'summary'            => 'nullable|string|max:500',
            'summary_ar'         => 'nullable|string|max:500',
            'description'        => "{$req}|string",
            'description_ar'     => 'nullable|string',
            'responsibilities'   => 'nullable|string',
            'responsibilities_ar'=> 'nullable|string',
            'requirements'       => 'nullable|string',
            'requirements_ar'    => 'nullable|string',
            'application_email'  => 'nullable|email|max:255',
            'application_url'    => 'nullable|string|max:500',
            'status'             => 'nullable|in:draft,open,close',
            'published_at'       => 'nullable|date',
            'expires_at'         => 'nullable|date',
        ];
    }

    /**
     * Validate that at least one application method is provided.
     * Returns an error response or null when valid.
     */
    private function checkApplicationMethod(Request $request, ?JobOpening $existing = null): ?JsonResponse
    {
        $email = $request->input('application_email', $existing?->application_email);
        $url   = $request->input('application_url',   $existing?->application_url);

        if (empty($email) && empty($url)) {
            return response()->json([
                'success' => false,
                'message' => 'At least one application method (application_email or application_url) is required.',
            ], 422);
        }

        return null;
    }

    /**
     * Validate that expires_at is after published_at.
     */
    private function checkExpiryAfterPublish(
        ?string $publishedAt,
        ?string $expiresAt
    ): ?JsonResponse {
        if ($publishedAt && $expiresAt && strtotime($expiresAt) <= strtotime($publishedAt)) {
            return response()->json([
                'success' => false,
                'message' => 'expires_at must be after published_at.',
            ], 422);
        }

        return null;
    }

    // ──────────────────────────────────────────────
    //  POST /api/job-openings — Create Job Opening
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Create a new job opening.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->validationRules(required: true));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // At least one application method required
        if ($error = $this->checkApplicationMethod($request)) {
            return $error;
        }

        // Resolve slug
        $slug = $request->filled('slug')
            ? $this->generateUniqueSlug($request->slug)
            : $this->generateUniqueSlug($request->title);

        // Resolve status
        $status = $request->input('status', 'draft');

        // Auto-set published_at when status is open and no date provided
        $publishedAt = $request->input('published_at');
        if ($status === 'open' && ! $publishedAt) {
            $publishedAt = now()->toDateTimeString();
        }

        // Validate expires_at > published_at
        if ($error = $this->checkExpiryAfterPublish($publishedAt, $request->expires_at)) {
            return $error;
        }

        $jobOpening = JobOpening::create([
            'title'              => $request->title,
            'title_ar'           => $request->title_ar,
            'slug'               => $slug,
            'department'         => $request->department,
            'department_ar'      => $request->department_ar,
            'location'           => $request->location,
            'location_ar'        => $request->location_ar,
            'employment_type'    => $request->employment_type,
            'employment_type_ar' => $request->employment_type_ar,
            'workplace_type'     => $request->workplace_type,
            'workplace_type_ar'  => $request->workplace_type_ar,
            'summary'            => $request->summary,
            'summary_ar'         => $request->summary_ar,
            'description'        => $request->description,
            'description_ar'     => $request->description_ar,
            'responsibilities'   => $request->responsibilities,
            'responsibilities_ar'=> $request->responsibilities_ar,
            'requirements'       => $request->requirements,
            'requirements_ar'    => $request->requirements_ar,
            'application_email'  => $request->application_email,
            'application_url'    => $request->application_url,
            'status'             => $status,
            'published_at'       => $publishedAt,
            'expires_at'         => $request->expires_at,
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'Job opening created successfully.',
            'job_opening' => $jobOpening,
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/job-openings — List Job Openings
    // ──────────────────────────────────────────────

    /**
     * Public — Paginated list of open, active job openings.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search'          => 'nullable|string|max:255',
            'department'      => 'nullable|string|max:255',
            'employment_type' => 'nullable|in:full-time,part-time,contract,internship,temporary',
            'workplace_type'  => 'nullable|in:on-site,remote,hybrid',
            'page'            => 'nullable|integer|min:1',
            'page_size'       => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $pageSize = (int) $request->input('page_size', 15);

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? JobOpening::query() : JobOpening::publiclyVisible())
            ->select([
                'id', 'title', 'title_ar', 'slug', 'department', 'department_ar', 'location', 'location_ar',
                'employment_type', 'employment_type_ar', 'workplace_type', 'workplace_type_ar',
                'summary', 'summary_ar',
                'status', 'published_at', 'expires_at', 'created_at',
            ]);

        // Filter by department
        if ($request->filled('department')) {
            $query->where('department', 'like', '%' . $request->department . '%');
        }

        // Filter by employment type
        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        // Filter by workplace type
        if ($request->filled('workplace_type')) {
            $query->where('workplace_type', $request->workplace_type);
        }

        // Search against title, summary, description
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                  ->orWhere('summary', 'like', $term)
                  ->orWhere('description', 'like', $term);
            });
        }

        $jobOpenings = $query->orderBy('published_at', 'desc')->paginate($pageSize);

        return response()->json([
            'success' => true,
            'data'    => $jobOpenings,
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/job-openings/{identifier} — Get Job Opening
    // ──────────────────────────────────────────────

    /**
     * Public — Return a single open job opening by numeric ID or slug.
     */
    public function show(string $identifier): JsonResponse
    {
        $isAdmin = $this->isAdmin();
        $query = $isAdmin ? JobOpening::query() : JobOpening::publiclyVisible();

        $jobOpening = is_numeric($identifier)
            ? $query->find((int) $identifier)
            : $query->where('slug', $identifier)->first();

        if (! $jobOpening) {
            return response()->json([
                'success' => false,
                'message' => 'Job opening not found.',
            ], 404);
        }

        return response()->json([
            'success'     => true,
            'job_opening' => $jobOpening,
        ]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/job-openings/{id} — Update Job Opening
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Update an existing job opening.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $jobOpening = JobOpening::find($id);

        if (! $jobOpening) {
            return response()->json([
                'success' => false,
                'message' => 'Job opening not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), $this->validationRules(required: false));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // At least one application method (merge existing values with incoming)
        if ($error = $this->checkApplicationMethod($request, $jobOpening)) {
            return $error;
        }

        $data = [];

        // Simple string fields
        foreach ([
            'title', 'title_ar', 'department', 'department_ar', 'location', 'location_ar',
            'employment_type', 'employment_type_ar', 'workplace_type', 'workplace_type_ar',
            'summary', 'summary_ar', 'description', 'description_ar',
            'responsibilities', 'responsibilities_ar', 'requirements', 'requirements_ar',
            'application_email', 'application_url',
        ] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        // Slug — re-check uniqueness excluding this record
        if ($request->filled('slug')) {
            $data['slug'] = $this->generateUniqueSlug($request->slug, $jobOpening->id);
        } elseif ($request->filled('title')) {
            $data['slug'] = $this->generateUniqueSlug($request->title, $jobOpening->id);
        }

        // Status + auto published_at when opening a draft
        if ($request->filled('status')) {
            $newStatus = $request->status;
            $data['status'] = $newStatus;

            if ($newStatus === 'open' && ! $jobOpening->published_at && ! $request->filled('published_at')) {
                $data['published_at'] = now()->toDateTimeString();
            }
        }

        if ($request->filled('published_at')) {
            $data['published_at'] = $request->published_at;
        }

        if ($request->has('expires_at')) {
            $data['expires_at'] = $request->expires_at;
        }

        // Validate expires_at vs published_at (use merged values)
        $resolvedPublishedAt = $data['published_at'] ?? $jobOpening->published_at?->toDateTimeString();
        $resolvedExpiresAt   = $data['expires_at']   ?? $jobOpening->expires_at?->toDateTimeString();

        if ($error = $this->checkExpiryAfterPublish($resolvedPublishedAt, $resolvedExpiresAt)) {
            return $error;
        }

        $jobOpening->update($data);

        return response()->json([
            'success'     => true,
            'message'     => 'Job opening updated successfully.',
            'job_opening' => $jobOpening->fresh(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/job-openings/{id} — Remove Job Opening
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Soft-delete a job opening.
     */
    public function destroy(int $id): JsonResponse
    {
        $jobOpening = JobOpening::find($id);

        if (! $jobOpening) {
            return response()->json([
                'success' => false,
                'message' => 'Job opening not found.',
            ], 404);
        }

        // Soft-delete — sets deleted_at; removed from all public queries
        $jobOpening->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job opening deleted successfully.',
        ]);
    }
}
