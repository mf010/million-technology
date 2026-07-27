<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    /**
     * Generate a unique slug, optionally excluding the current service by ID.
     */
    private function generateUniqueSlug(string $source, ?int $excludeId = null): string
    {
        $base    = Str::slug($source);
        $slug    = $base;
        $counter = 2;

        while (
            Service::withTrashed()
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
     * Store an uploaded image/icon file and return its relative storage path.
     */
    private function storeFile($file): string
    {
        return $file->store('services', 'public');
    }

    /**
     * Delete a stored file by its relative path.
     */
    private function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    // ──────────────────────────────────────────────
    //  POST /api/services — Create Service
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Create a new service or sub-service.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'parent_id'            => 'nullable|integer|exists:services,id',
            'title'                => 'required|string|max:255',
            'title_ar'             => 'nullable|string|max:255',
            'slug'                 => 'nullable|string|max:255',
            'short_description'    => 'nullable|string|max:500',
            'short_description_ar' => 'nullable|string|max:500',
            'description'          => 'nullable|string',
            'description_ar'       => 'nullable|string',
            'icon'                 => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'image'                => 'nullable|image|max:5120',
            'display_order'        => 'nullable|integer|min:0',
            'is_active'            => 'nullable|boolean',
            'seo_title'            => 'nullable|string|max:255',
            'seo_description'      => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Validate parent service — must exist, be active, and be a top-level service (one level only)
        if ($request->filled('parent_id')) {
            $parent = Service::find($request->parent_id);

            if (! $parent || ! $parent->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parent service not found or is inactive.',
                ], 422);
            }

            // Enforce one-level hierarchy: a subservice cannot itself be a parent
            if ($parent->parent_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Services are limited to one level of nesting. The selected parent is already a subservice.',
                ], 422);
            }
        }

        // Resolve slug
        $slug = $request->filled('slug')
            ? $this->generateUniqueSlug($request->slug)
            : $this->generateUniqueSlug($request->title);

        // Store uploaded files
        $iconPath  = $request->hasFile('icon')  ? $this->storeFile($request->file('icon'))  : null;
        $imagePath = $request->hasFile('image') ? $this->storeFile($request->file('image')) : null;

        $service = Service::create([
            'parent_id'            => $request->parent_id,
            'title'                => $request->title,
            'title_ar'             => $request->title_ar,
            'slug'                 => $slug,
            'short_description'    => $request->short_description,
            'short_description_ar' => $request->short_description_ar,
            'description'          => $request->description,
            'description_ar'       => $request->description_ar,
            'icon'                 => $iconPath,
            'image'                => $imagePath,
            'display_order'        => $request->input('display_order', 0),
            'is_active'            => $request->input('is_active', true),
            'seo_title'            => $request->seo_title,
            'seo_description'      => $request->seo_description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully.',
            'service' => $service->load('subServices'),
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/services — List Services
    // ──────────────────────────────────────────────

    /**
     * Public — Return active services with their active subservices.
     * Optionally filter by parent_id or search term.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'parent_id' => 'nullable|integer',
            'search'    => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? Service::query() : Service::active())
            ->with('subServices')
            ->orderBy('display_order')
            ->orderBy('title');

        if ($request->filled('parent_id')) {
            // Return subservices of a specific parent
            $query->where('parent_id', $request->parent_id);
        } else {
            // Return only top-level services (each carries their subservices eagerly)
            $query->topLevel();
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                  ->orWhere('short_description', 'like', $term)
                  ->orWhere('description', 'like', $term);
            });
        }

        $services = $query->get();

        return response()->json([
            'success'  => true,
            'services' => $services,
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/services/{identifier} — Get Service
    // ──────────────────────────────────────────────

    /**
     * Public — Return a single active service by numeric ID or slug,
     * including its active subservices when applicable.
     */
    public function show(string $identifier): JsonResponse
    {
        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? Service::query() : Service::active())->with('subServices');

        $service = is_numeric($identifier)
            ? $query->find((int) $identifier)
            : $query->where('slug', $identifier)->first();

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'service' => $service,
        ]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/services/{id} — Update Service
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Update an existing service.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'parent_id'            => 'nullable|integer|exists:services,id',
            'title'                => 'nullable|string|max:255',
            'title_ar'             => 'nullable|string|max:255',
            'slug'                 => 'nullable|string|max:255',
            'short_description'    => 'nullable|string|max:500',
            'short_description_ar' => 'nullable|string|max:500',
            'description'          => 'nullable|string',
            'description_ar'       => 'nullable|string',
            'icon'                 => 'nullable|file|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'image'                => 'nullable|image|max:5120',
            'display_order'        => 'nullable|integer|min:0',
            'is_active'            => 'nullable|boolean',
            'seo_title'            => 'nullable|string|max:255',
            'seo_description'      => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Parent relationship validation
        if ($request->has('parent_id') && $request->parent_id !== null) {
            $newParentId = (int) $request->parent_id;

            // Prevent a service from becoming its own parent
            if ($newParentId === $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'A service cannot be its own parent.',
                ], 422);
            }

            $parent = Service::find($newParentId);

            if (! $parent || ! $parent->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parent service not found or is inactive.',
                ], 422);
            }

            // Prevent circular reference: the chosen parent cannot be a subservice of this service
            if ($parent->parent_id === $id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Circular parent relationship detected.',
                ], 422);
            }

            // Enforce one-level hierarchy
            if ($parent->parent_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Services are limited to one level of nesting.',
                ], 422);
            }
        }

        $data = [];

        // Scalar fields
        foreach (['title', 'title_ar', 'short_description', 'short_description_ar', 'description', 'description_ar', 'display_order', 'is_active', 'seo_title', 'seo_description'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        // parent_id (allow setting to null = promote to top-level)
        if ($request->has('parent_id')) {
            $data['parent_id'] = $request->parent_id;
        }

        // Slug — unique excluding this service
        if ($request->filled('slug')) {
            $data['slug'] = $this->generateUniqueSlug($request->slug, $service->id);
        } elseif ($request->filled('title')) {
            $data['slug'] = $this->generateUniqueSlug($request->title, $service->id);
        }

        // Icon — replace and delete old
        if ($request->hasFile('icon')) {
            $this->deleteFile($service->icon);
            $data['icon'] = $this->storeFile($request->file('icon'));
        }

        // Image — replace and delete old
        if ($request->hasFile('image')) {
            $this->deleteFile($service->image);
            $data['image'] = $this->storeFile($request->file('image'));
        }

        $service->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully.',
            'service' => $service->fresh()->load('subServices'),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/services/{id} — Remove Service
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Soft-delete a service and all its subservices.
     * A service with active subservices is cascade soft-deleted along with them.
     */
    public function destroy(int $id): JsonResponse
    {
        $service = Service::with('allSubServices')->find($id);

        if (! $service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        // Cascade soft-delete all subservices first
        if ($service->allSubServices->isNotEmpty()) {
            Service::where('parent_id', $id)->delete();
        }

        // Soft-delete the service itself
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service and its subservices deleted successfully.',
        ]);
    }
}
