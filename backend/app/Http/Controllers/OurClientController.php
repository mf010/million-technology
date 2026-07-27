<?php

namespace App\Http\Controllers;

use App\Models\OurClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class OurClientController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    private function storeLogo($file): string
    {
        return $file->store('clients', 'public');
    }

    private function deleteLogo(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    // ──────────────────────────────────────────────
    //  POST /api/our-clients — Create Client
    // ──────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'logo'           => 'nullable|image|max:2048',
            'website_url'    => 'nullable|url|max:500',
            'description'    => 'nullable|string|max:1000',
            'description_ar' => 'nullable|string|max:1000',
            'is_featured'    => 'nullable|boolean',
            'is_active'      => 'nullable|boolean',
            'display_order'  => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $logoPath = $request->hasFile('logo') ? $this->storeLogo($request->file('logo')) : null;

        $client = OurClient::create([
            'name'           => $request->name,
            'logo'           => $logoPath,
            'website_url'    => $request->website_url,
            'description'    => $request->description,
            'description_ar' => $request->description_ar,
            'is_featured'    => $request->input('is_featured', false),
            'is_active'      => $request->input('is_active', true),
            'display_order'  => $request->input('display_order', 0),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Client created successfully.',
            'client'  => $client,
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/our-clients — List Clients
    // ──────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_featured' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $isAdmin = $this->isAdmin();
        $query = ($isAdmin ? OurClient::query() : OurClient::active())
            ->orderBy('display_order')
            ->orderBy('name');

        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'success' => true,
            'clients' => $query->get(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/our-clients/{id} — Get Client
    // ──────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        $isAdmin = $this->isAdmin();
        $client = ($isAdmin ? OurClient::query() : OurClient::active())->find($id);

        if (! $client) {
            return response()->json(['success' => false, 'message' => 'Client not found.'], 404);
        }

        return response()->json(['success' => true, 'client' => $client]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/our-clients/{id} — Update Client
    // ──────────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $client = OurClient::find($id);

        if (! $client) {
            return response()->json(['success' => false, 'message' => 'Client not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'nullable|string|max:255',
            'logo'           => 'nullable|image|max:2048',
            'website_url'    => 'nullable|url|max:500',
            'description'    => 'nullable|string|max:1000',
            'description_ar' => 'nullable|string|max:1000',
            'is_featured'    => 'nullable|boolean',
            'is_active'      => 'nullable|boolean',
            'display_order'  => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = [];
        foreach (['name', 'website_url', 'description', 'description_ar', 'is_featured', 'is_active', 'display_order'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        if ($request->hasFile('logo')) {
            $this->deleteLogo($client->logo);
            $data['logo'] = $this->storeLogo($request->file('logo'));
        }

        $client->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Client updated successfully.',
            'client'  => $client->fresh(),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/our-clients/{id} — Remove Client
    // ──────────────────────────────────────────────

    /**
     * Soft-delete the client.
     * Related PreviousProject records retain their data; the our_client_id FK
     * is set to NULL automatically via the nullOnDelete() constraint,
     * preserving historical project information.
     */
    public function destroy(int $id): JsonResponse
    {
        $client = OurClient::find($id);

        if (! $client) {
            return response()->json(['success' => false, 'message' => 'Client not found.'], 404);
        }

        $client->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client deleted successfully. Related project records have been preserved.',
        ]);
    }
}
