<?php

namespace App\Http\Controllers;

use App\Models\ClientReach;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\HtmlString;

class ClientReachController extends Controller
{
    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    /**
     * Strip all HTML tags and potentially dangerous script content from a string.
     */
    private function sanitize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        // Remove script / style blocks and all tags, then trim whitespace
        $stripped = preg_replace('/<(script|style)[^>]*>.*?<\/\1>/is', '', $value);
        return trim(strip_tags($stripped ?? ''));
    }

    // ──────────────────────────────────────────────
    //  POST /api/client-reach — Submit Client Message
    // ──────────────────────────────────────────────

    /**
     * Public — Submit a client contact message.
     * Rate-limited via route middleware (60 requests / minute per IP by default).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|max:255',
            'phone_number' => ['nullable', 'string', 'max:30', 'regex:/^[\+\d\s\-\(\)]{7,30}$/'],
            'company_name' => 'nullable|string|max:255',
            'subject'      => 'required|string|max:255',
            'message_type' => 'required|in:request,question,partnership,complaint,other',
            'message'      => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Sanitize free-text fields to prevent stored XSS
        $clientReach = ClientReach::create([
            'name'         => $this->sanitize($request->name),
            'email'        => $request->email,
            'phone_number' => $this->sanitize($request->phone_number),
            'company_name' => $this->sanitize($request->company_name),
            'subject'      => $this->sanitize($request->subject),
            'message_type' => $request->message_type,
            'message'      => $this->sanitize($request->message),
            'status'       => 'new',
        ]);

        // Return only public-safe confirmation fields (no internal_notes / handled_at)
        return response()->json([
            'success'    => true,
            'message'    => 'Your message has been received. We will get back to you shortly.',
            'reference'  => $clientReach->id,
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  GET /api/client-reach — List Client Messages
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Paginated list of client messages with filtering and search.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search'         => 'nullable|string|max:255',
            'message_type'   => 'nullable|in:request,question,partnership,complaint,other',
            'status'         => 'nullable|in:new,in-progress,resolved,archived',
            'date_from'      => 'nullable|date',
            'date_to'        => 'nullable|date|after_or_equal:date_from',
            'page'           => 'nullable|integer|min:1',
            'page_size'      => 'nullable|integer|min:1|max:100',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $pageSize      = (int) $request->input('page_size', 15);
        $sortDirection = $request->input('sort_direction', 'desc');

        // Authenticated admin view — make hidden fields visible
        $query = ClientReach::withoutGlobalScopes()
            ->select([
                'id', 'name', 'email', 'phone_number', 'company_name',
                'subject', 'message_type', 'message', 'status',
                'internal_notes', 'handled_at', 'created_at',
            ]);

        // Search against name, email, company_name, subject, message
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('email', 'like', $term)
                  ->orWhere('company_name', 'like', $term)
                  ->orWhere('subject', 'like', $term)
                  ->orWhere('message', 'like', $term);
            });
        }

        // Filter by message type
        if ($request->filled('message_type')) {
            $query->where('message_type', $request->message_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range (created_at)
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $messages = $query->orderBy('created_at', $sortDirection)->paginate($pageSize);

        return response()->json([
            'success' => true,
            'data'    => $messages,
        ]);
    }

    // ──────────────────────────────────────────────
    //  GET /api/client-reach/{id} — Get Client Message
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Return a single client message with all internal fields.
     */
    public function show(int $id): JsonResponse
    {
        // makeVisible restores the fields hidden on the model for the admin view
        $clientReach = ClientReach::find($id);

        if (! $clientReach) {
            return response()->json([
                'success' => false,
                'message' => 'Client message not found.',
            ], 404);
        }

        return response()->json([
            'success'      => true,
            'client_reach' => $clientReach->makeVisible(['internal_notes', 'handled_at', 'deleted_at']),
        ]);
    }

    // ──────────────────────────────────────────────
    //  PUT /api/client-reach/{id} — Update Client Message
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Update the status and/or internal notes of a client message.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $clientReach = ClientReach::find($id);

        if (! $clientReach) {
            return response()->json([
                'success' => false,
                'message' => 'Client message not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'         => 'nullable|in:new,in-progress,resolved,archived',
            'internal_notes' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = [];

        // Internal notes update
        if ($request->has('internal_notes')) {
            $data['internal_notes'] = $request->internal_notes;
        }

        // Status + handled_at logic
        if ($request->filled('status')) {
            $newStatus = $request->status;
            $data['status'] = $newStatus;

            if ($newStatus === 'resolved') {
                // Set handled_at when transitioning to resolved
                $data['handled_at'] = now();
            } elseif (in_array($newStatus, ['new', 'in-progress', 'archived'])) {
                // Clear handled_at when moving away from resolved
                $data['handled_at'] = null;
            }
        }

        $clientReach->update($data);

        return response()->json([
            'success'      => true,
            'message'      => 'Client message updated successfully.',
            'client_reach' => $clientReach->fresh()->makeVisible(['internal_notes', 'handled_at']),
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE /api/client-reach/{id} — Remove Client Message
    // ──────────────────────────────────────────────

    /**
     * Authenticated — Soft-delete a client message (retained for auditing).
     */
    public function destroy(int $id): JsonResponse
    {
        $clientReach = ClientReach::find($id);

        if (! $clientReach) {
            return response()->json([
                'success' => false,
                'message' => 'Client message not found.',
            ], 404);
        }

        // Soft-delete — sets deleted_at; record is preserved for auditing/restoration
        $clientReach->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client message deleted successfully.',
        ]);
    }
}
