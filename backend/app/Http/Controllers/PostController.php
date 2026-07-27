<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PostController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    /**
     * Generate a unique slug from the given title.
     * Appends a numeric suffix when a conflict is detected, excluding a given post ID.
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $counter = 2;

        while (
            Post::withTrashed()
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
     * Store a cover image and return its relative storage path.
     */
    private function storeCoverImage($file): string
    {
        return $file->store('posts', 'public');
    }

    /**
     * Delete a stored cover image by its relative path.
     */
    private function deleteCoverImage(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    // ──────────────────────────────────────────────
    //  POST /api/posts — Create Post
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Create a new post.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'           => 'required|string|max:255',
            'title_ar'        => 'nullable|string|max:255',
            'slug'            => 'nullable|string|max:255',
            'excerpt'         => 'nullable|string|max:500',
            'excerpt_ar'      => 'nullable|string|max:500',
            'content'         => 'required|string',
            'content_ar'      => 'nullable|string',
            'cover_image'     => 'nullable|image|max:5120', // 5 MB
            'status'          => 'nullable|in:draft,published,archived',
            'published_at'    => 'nullable|date',
            'seo_title'       => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Resolve slug
        $slug = $request->filled('slug')
            ? $this->generateUniqueSlug($request->slug)
            : $this->generateUniqueSlug($request->title);

        // Handle cover image
        $coverImagePath = null;
        if ($request->hasFile('cover_image')) {
            $coverImagePath = $this->storeCoverImage($request->file('cover_image'));
        }

        // Resolve status
        $status = $request->input('status', 'draft');

        // Auto-set published_at when status is published and no date provided
        $publishedAt = $request->input('published_at');
        if ($status === 'published' && ! $publishedAt) {
            $publishedAt = now();
        }

        $post = Post::create([
            'author_user_id'  => auth('api')->id(),
            'title'           => $request->title,
            'title_ar'        => $request->title_ar,
            'slug'            => $slug,
            'excerpt'         => $request->excerpt,
            'excerpt_ar'      => $request->excerpt_ar,
            'content'         => $request->content,
            'content_ar'      => $request->content_ar,
            'cover_image'     => $coverImagePath,
            'status'          => $status,
            'published_at'    => $publishedAt,
            'seo_title'       => $request->seo_title,
            'seo_description' => $request->seo_description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully.',
            'post'    => $post->load('author:id,name,email'),
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/posts — List Published Posts
    // ──────────────────────────────────────────────

    /**
     * Public — Paginated list of published posts (summary only, no content field).
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search'         => 'nullable|string|max:255',
            'page'           => 'nullable|integer|min:1',
            'page_size'      => 'nullable|integer|min:1|max:100',
            'sort_by'        => 'nullable|in:published_at,title,created_at',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $pageSize      = (int) $request->input('page_size', 15);
        $sortBy        = $request->input('sort_by', 'published_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? Post::query() : Post::publiclyVisible())
            ->with('author:id,name')
            ->select([
                'id', 'author_user_id', 'title', 'title_ar', 'slug',
                'excerpt', 'excerpt_ar', 'cover_image', 'status',
                'published_at', 'seo_title', 'seo_description', 'created_at',
            ]);

        // Full-text search against title, excerpt, content
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                  ->orWhere('excerpt', 'like', $term)
                  ->orWhere('content', 'like', $term);
            });
        }

        $posts = $query->orderBy($sortBy, $sortDirection)->paginate($pageSize);

        return response()->json([
            'success' => true,
            'data'    => $posts,
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/posts/{identifier} — Get Post
    // ──────────────────────────────────────────────

    /**
     * Public — Return a single published post by numeric ID or slug.
     */
    public function show(string $identifier): JsonResponse
    {
        // Determine if identifier is numeric (ID) or slug
        $isAdmin = $this->isAdmin();
        $baseQuery = $isAdmin ? Post::query() : Post::publiclyVisible();
        $query = $baseQuery->with('author:id,name,email');

        if (is_numeric($identifier)) {
            $post = $query->find((int) $identifier);
        } else {
            $post = $query->where('slug', $identifier)->first();
        }

        if (! $post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'post'    => $post,
        ]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/posts/{id} — Update Post
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Update an existing post.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'           => 'nullable|string|max:255',
            'title_ar'        => 'nullable|string|max:255',
            'slug'            => 'nullable|string|max:255',
            'excerpt'         => 'nullable|string|max:500',
            'excerpt_ar'      => 'nullable|string|max:500',
            'content'         => 'nullable|string',
            'content_ar'      => 'nullable|string',
            'cover_image'     => 'nullable|image|max:5120',
            'status'          => 'nullable|in:draft,published,archived',
            'published_at'    => 'nullable|date',
            'seo_title'       => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = [];

        // Title
        if ($request->filled('title')) {
            $data['title'] = $request->title;
        }

        if ($request->has('title_ar')) {
            $data['title_ar'] = $request->title_ar;
        }

        // Slug — re-check uniqueness excluding this post
        if ($request->filled('slug')) {
            $data['slug'] = $this->generateUniqueSlug($request->slug, $post->id);
        } elseif ($request->filled('title')) {
            // Auto-regenerate slug when title changes but no explicit slug given
            $data['slug'] = $this->generateUniqueSlug($request->title, $post->id);
        }

        // Simple scalar fields
        foreach (['excerpt', 'excerpt_ar', 'content', 'content_ar', 'seo_title', 'seo_description'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        // Status + auto published_at
        if ($request->filled('status')) {
            $newStatus = $request->status;
            $data['status'] = $newStatus;

            // Auto-set published_at when transitioning to published without explicit date
            if ($newStatus === 'published' && ! $post->published_at && ! $request->filled('published_at')) {
                $data['published_at'] = now();
            }
        }

        if ($request->filled('published_at')) {
            $data['published_at'] = $request->published_at;
        }

        // Cover image — replace and delete old one
        if ($request->hasFile('cover_image')) {
            $this->deleteCoverImage($post->cover_image);
            $data['cover_image'] = $this->storeCoverImage($request->file('cover_image'));
        }

        $post->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully.',
            'post'    => $post->fresh()->load('author:id,name,email'),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/posts/{id} — Remove Post
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Soft-delete a post.
     */
    public function destroy(int $id): JsonResponse
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.',
            ], 404);
        }

        // Soft-delete — SoftDeletes trait sets deleted_at; post vanishes from all public queries
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.',
        ]);
    }
}
