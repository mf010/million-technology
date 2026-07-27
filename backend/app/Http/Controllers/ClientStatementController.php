<?php

namespace App\Http\Controllers;

use App\Models\ClientStatement;
use App\Models\OurClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ClientStatementController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    private function storeImage($file): string
    {
        return $file->store('statements', 'public');
    }

    private function deleteImage(?string $path): void
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
            'our_client_id'      => 'nullable|integer|exists:our_clients,id',
            'client_name'        => "{$req}|string|max:255",
            'client_name_ar'     => 'nullable|string|max:255',
            'client_position'    => 'nullable|string|max:255',
            'client_position_ar' => 'nullable|string|max:255',
            'company_name'       => 'nullable|string|max:255',
            'company_name_ar'    => 'nullable|string|max:255',
            'statement'          => "{$req}|string|min:10|max:2000",
            'statement_ar'       => 'nullable|string|max:2000',
            'client_image'       => 'nullable|image|max:2048',
            'rating'             => "{$req}|integer|min:1|max:5",
            'is_published'       => 'nullable|boolean',
            'is_featured'        => 'nullable|boolean',
            'display_order'      => 'nullable|integer|min:0',
        ];
    }

    // ──────────────────────────────────────────────
    //  POST /api/client-statements — Create Statement
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Create a new client statement/testimonial.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->validationRules(required: true));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Resolve company_name from linked client when not explicitly provided
        $companyName = $request->company_name;
        if (! $companyName && $request->filled('our_client_id')) {
            $linkedClient = OurClient::find($request->our_client_id);
            $companyName  = $linkedClient?->name;
        }

        $imagePath = $request->hasFile('client_image')
            ? $this->storeImage($request->file('client_image'))
            : null;

        $statement = ClientStatement::create([
            'our_client_id'      => $request->our_client_id,
            'client_name'        => $request->client_name,
            'client_name_ar'     => $request->client_name_ar,
            'client_position'    => $request->client_position,
            'client_position_ar' => $request->client_position_ar,
            'company_name'       => $companyName,
            'company_name_ar'    => $request->company_name_ar,
            'statement'          => $request->statement,
            'statement_ar'       => $request->statement_ar,
            'client_image'       => $imagePath,
            'rating'             => $request->rating,
            'is_published'       => $request->input('is_published', false),
            'is_featured'        => $request->input('is_featured', false),
            'display_order'      => $request->input('display_order', 0),
        ]);

        return response()->json([
            'success'   => true,
            'message'   => 'Client statement created successfully.',
            'statement' => $statement->load('client:id,name,logo'),
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/client-statements — List Statements
    // ──────────────────────────────────────────────

    /**
     * Public — List published statements with optional featured/client filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_featured' => 'nullable|boolean',
            'client_id'   => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? ClientStatement::query() : ClientStatement::published())
            ->with('client:id,name,logo')
            ->orderBy('display_order')
            ->orderByDesc('created_at');

        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('client_id')) {
            $query->where('our_client_id', $request->client_id);
        }

        return response()->json([
            'success'    => true,
            'statements' => $query->get(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/client-statements/{id} — Get Statement
    // ──────────────────────────────────────────────

    /**
     * Public — Return a single published statement with related client info.
     */
    public function show(int $id): JsonResponse
    {
        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? ClientStatement::query() : ClientStatement::published())
            ->with('client:id,name,logo,website_url');

        $statement = $query->find($id);

        if (! $statement) {
            return response()->json(['success' => false, 'message' => 'Client statement not found.'], 404);
        }

        return response()->json([
            'success'   => true,
            'statement' => $statement,
        ]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/client-statements/{id} — Update Statement
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Update an existing client statement.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $statement = ClientStatement::find($id);

        if (! $statement) {
            return response()->json(['success' => false, 'message' => 'Client statement not found.'], 404);
        }

        $validator = Validator::make($request->all(), $this->validationRules(required: false));

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = [];

        foreach (['our_client_id', 'client_name', 'client_name_ar', 'client_position', 'client_position_ar', 'company_name', 'company_name_ar', 'statement', 'statement_ar', 'rating', 'is_published', 'is_featured', 'display_order'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        // Auto-populate company_name from the newly linked client when not explicitly given
        if (isset($data['our_client_id']) && ! isset($data['company_name'])) {
            $linkedClient          = OurClient::find($data['our_client_id']);
            $data['company_name']  = $linkedClient?->name ?? $statement->company_name;
        }

        // Replace client image and delete the old one
        if ($request->hasFile('client_image')) {
            $this->deleteImage($statement->client_image);
            $data['client_image'] = $this->storeImage($request->file('client_image'));
        }

        $statement->update($data);

        return response()->json([
            'success'   => true,
            'message'   => 'Client statement updated successfully.',
            'statement' => $statement->fresh()->load('client:id,name,logo'),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/client-statements/{id} — Remove Statement
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Soft-delete a client statement.
     */
    public function destroy(int $id): JsonResponse
    {
        $statement = ClientStatement::find($id);

        if (! $statement) {
            return response()->json(['success' => false, 'message' => 'Client statement not found.'], 404);
        }

        $statement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client statement deleted successfully.',
        ]);
    }
}
