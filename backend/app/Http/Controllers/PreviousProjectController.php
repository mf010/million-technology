<?php

namespace App\Http\Controllers;

use App\Models\OurClient;
use App\Models\PreviousProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PreviousProjectController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    private function generateUniqueSlug(string $source, ?int $excludeId = null): string
    {
        $base    = Str::slug($source);
        $slug    = $base;
        $counter = 2;

        while (
            PreviousProject::withTrashed()
                ->where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function storeCover($file): string
    {
        return $file->store('projects/covers', 'public');
    }

    private function storeGalleryImage($file): string
    {
        return $file->store('projects/gallery', 'public');
    }

    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Shared validation rules for create / update.
     */
    private function validationRules(bool $required = true): array
    {
        $req = $required ? 'required' : 'nullable';

        return [
            'our_client_id'            => 'nullable|integer|exists:our_clients,id',
            'title'                    => "{$req}|string|max:255",
            'title_ar'                 => 'nullable|string|max:255',
            'slug'                     => 'nullable|string|max:255',
            'client_display_name'      => 'nullable|string|max:255',
            'client_display_name_ar'   => 'nullable|string|max:255',
            'short_description'        => 'nullable|string|max:500',
            'short_description_ar'     => 'nullable|string|max:500',
            'description'              => 'nullable|string',
            'description_ar'           => 'nullable|string',
            'challenge'                => 'nullable|string',
            'challenge_ar'             => 'nullable|string',
            'solution'                 => 'nullable|string',
            'solution_ar'              => 'nullable|string',
            'results'                  => 'nullable|string',
            'results_ar'               => 'nullable|string',
            'technologies'             => 'nullable|array',
            'technologies.*'           => 'string|max:100',
            'technologies_ar'          => 'nullable|array',
            'technologies_ar.*'        => 'string|max:100',
            'cover_image'              => 'nullable|image|max:5120',
            'gallery_images'           => 'nullable|array',
            'gallery_images.*'         => 'image|max:5120',
            'removed_gallery_images'   => 'nullable|array',
            'removed_gallery_images.*' => 'string',
            'project_url'              => 'nullable|string|max:500',
            'completed_at'             => 'nullable|date',
            'is_featured'              => 'nullable|boolean',
            'is_published'             => 'nullable|boolean',
            'display_order'            => 'nullable|integer|min:0',
            'seo_title'                => 'nullable|string|max:255',
            'seo_description'          => 'nullable|string|max:500',
        ];
    }

    // ──────────────────────────────────────────────
    //  POST /api/previous-projects — Create Project
    // ──────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->validationRules(required: true));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Validate client: if our_client_id provided, it must be an active client
        if ($request->filled('our_client_id')) {
            $clientExists = OurClient::where('id', $request->our_client_id)
                ->where('is_active', true)
                ->exists();

            if (! $clientExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'The specified client does not exist or is inactive.',
                ], 422);
            }
        }

        $slug = $request->filled('slug')
            ? $this->generateUniqueSlug($request->slug)
            : $this->generateUniqueSlug($request->title);

        // Cover image
        $coverPath = $request->hasFile('cover_image')
            ? $this->storeCover($request->file('cover_image'))
            : null;

        // Gallery images — multiple files
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $galleryPaths[] = $this->storeGalleryImage($file);
            }
        }

        $project = PreviousProject::create([
            'our_client_id'          => $request->our_client_id,
            'title'                  => $request->title,
            'title_ar'               => $request->title_ar,
            'slug'                   => $slug,
            'client_display_name'    => $request->client_display_name,
            'client_display_name_ar' => $request->client_display_name_ar,
            'short_description'      => $request->short_description,
            'short_description_ar'   => $request->short_description_ar,
            'description'            => $request->description,
            'description_ar'         => $request->description_ar,
            'challenge'              => $request->challenge,
            'challenge_ar'           => $request->challenge_ar,
            'solution'               => $request->solution,
            'solution_ar'            => $request->solution_ar,
            'results'                => $request->results,
            'results_ar'             => $request->results_ar,
            'technologies'           => $request->input('technologies', []),
            'technologies_ar'        => $request->input('technologies_ar'),
            'cover_image'            => $coverPath,
            'gallery_images'         => $galleryPaths ?: null,
            'project_url'            => $request->project_url,
            'completed_at'           => $request->completed_at,
            'is_featured'            => $request->input('is_featured', false),
            'is_published'           => $request->input('is_published', false),
            'display_order'          => $request->input('display_order', 0),
            'seo_title'              => $request->seo_title,
            'seo_description'        => $request->seo_description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully.',
            'project' => $project->load('client'),
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/previous-projects — List Projects
    // ──────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search'      => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'technology'  => 'nullable|string|max:100',
            'client_id'   => 'nullable|integer',
            'page'        => 'nullable|integer|min:1',
            'page_size'   => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $pageSize = (int) $request->input('page_size', 15);

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? PreviousProject::query() : PreviousProject::published())
            ->with('client:id,name,logo,website_url')
            ->select([
                'id', 'our_client_id', 'title', 'title_ar', 'slug', 'client_display_name', 'client_display_name_ar',
                'short_description', 'short_description_ar', 'technologies', 'technologies_ar', 'cover_image',
                'completed_at', 'is_featured', 'display_order', 'created_at',
            ])
            ->orderBy('display_order')
            ->orderByDesc('completed_at');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                  ->orWhere('short_description', 'like', $term)
                  ->orWhere('description', 'like', $term)
                  ->orWhere('client_display_name', 'like', $term);
            });
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('client_id')) {
            $query->where('our_client_id', $request->client_id);
        }

        // Filter by a specific technology string within the JSON array
        if ($request->filled('technology')) {
            $query->whereJsonContains('technologies', $request->technology);
        }

        return response()->json([
            'success' => true,
            'data'    => $query->paginate($pageSize),
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/previous-projects/{identifier} — Get Project
    // ──────────────────────────────────────────────

    public function show(string $identifier): JsonResponse
    {
        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? PreviousProject::query() : PreviousProject::published())->with('client:id,name,logo,website_url');

        $project = is_numeric($identifier)
            ? $query->find((int) $identifier)
            : $query->where('slug', $identifier)->first();

        if (! $project) {
            return response()->json(['success' => false, 'message' => 'Project not found.'], 404);
        }

        return response()->json(['success' => true, 'project' => $project]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/previous-projects/{id} — Update Project
    // ──────────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $project = PreviousProject::find($id);

        if (! $project) {
            return response()->json(['success' => false, 'message' => 'Project not found.'], 404);
        }

        $validator = Validator::make($request->all(), $this->validationRules(required: false));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = [];

        // Scalar / simple fields
        foreach ([
            'our_client_id', 'title', 'title_ar', 'client_display_name', 'client_display_name_ar',
            'short_description', 'short_description_ar',
            'description', 'description_ar', 'challenge', 'challenge_ar',
            'solution', 'solution_ar', 'results', 'results_ar',
            'technologies', 'technologies_ar',
            'project_url', 'completed_at', 'is_featured', 'is_published',
            'display_order', 'seo_title', 'seo_description',
        ] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        // Slug
        if ($request->filled('slug')) {
            $data['slug'] = $this->generateUniqueSlug($request->slug, $project->id);
        } elseif ($request->filled('title')) {
            $data['slug'] = $this->generateUniqueSlug($request->title, $project->id);
        }

        // Cover image — replace and delete old
        if ($request->hasFile('cover_image')) {
            $this->deleteFile($project->cover_image);
            $data['cover_image'] = $this->storeCover($request->file('cover_image'));
        }

        // Gallery images — incremental add/remove
        $currentGallery = (array) $project->gallery_images;

        // Remove specific gallery images
        if ($request->has('removed_gallery_images')) {
            $toRemove = (array) $request->input('removed_gallery_images');
            foreach ($toRemove as $path) {
                $this->deleteFile($path);
            }
            $currentGallery = array_values(array_diff($currentGallery, $toRemove));
        }

        // Append new gallery images
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $currentGallery[] = $this->storeGalleryImage($file);
            }
        }

        // Only update if gallery was modified
        if ($request->has('removed_gallery_images') || $request->hasFile('gallery_images')) {
            $data['gallery_images'] = $currentGallery ?: null;
        }

        $project->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully.',
            'project' => $project->fresh()->load('client'),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/previous-projects/{id} — Remove Project
    // ──────────────────────────────────────────────

    public function destroy(int $id): JsonResponse
    {
        $project = PreviousProject::find($id);

        if (! $project) {
            return response()->json(['success' => false, 'message' => 'Project not found.'], 404);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully.',
        ]);
    }
}
