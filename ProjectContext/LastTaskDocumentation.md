# Last Task Documentation — ClientStatement Model Implementation

**Task Completed:** 2026-07-12  
**Backend:** Laravel 13 (PHP 8.3) · SQLite · `tymon/jwt-auth ^2.3`

---

## 1. Overview

This task implements the `ClientStatement` model — testimonials and reviews left by clients. Statements can be linked to an existing `OurClient` record, or created as standalone with free-text client details. When a linked client is soft-deleted, the FK is set to `NULL` (preserving the testimonial's data via `nullOnDelete()`).

---

## 2. Files Created / Modified

| File | Change |
|------|--------|
| `database/migrations/2026_07_12_141027_create_client_statements_table.php` | **New** |
| `app/Models/ClientStatement.php` | **New** |
| `app/Http/Controllers/ClientStatementController.php` | **New** — 5 endpoints |
| `routes/api.php` | **Modified** — 5 new routes |
| `ProjectContext/Models/ClientStatement.md` | **Modified** — Functionality Roots filled |

---

## 3. Database — `client_statements` Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `our_client_id` | FK → `our_clients.id`, nullable | `nullOnDelete()` — testimonial retained when client deleted |
| `client_name` | string(255) | required |
| `client_position` | string(255), nullable | e.g. "CTO", "Head of Product" |
| `company_name` | string(255), nullable | auto-filled from linked client's `name` when omitted |
| `statement` | text | required, 10–2000 chars |
| `client_image` | string, nullable | stored path under `storage/app/public/statements/` |
| `rating` | tinyint (1–5) | required |
| `is_published` | boolean | default false |
| `is_featured` | boolean | default false |
| `display_order` | unsigned int | default 0 |
| `created_at` / `updated_at` | timestamps | |
| `deleted_at` | timestamp, nullable | soft-delete |

---

## 4. API Endpoints

Base URL: `http://localhost:8000/api`  
Content-Type: `multipart/form-data` (when uploading an image) or `application/json`  
Authorization header (protected routes): `Authorization: Bearer <token>`

---

### POST `/api/client-statements` 🔒
**Create a new client statement.**

**Request Fields:**
| Field | Required | Rules |
|-------|:--------:|-------|
| `client_name` | ✓ | string, max 255 |
| `statement` | ✓ | string, min 10, max 2000 |
| `rating` | ✓ | integer, 1–5 |
| `our_client_id` | ✗ | integer, must exist in our_clients |
| `client_position` | ✗ | string, max 255 |
| `company_name` | ✗ | string — **auto-populated from linked client's name** if omitted |
| `client_image` | ✗ | image file, max 2 MB |
| `is_published` | ✗ | boolean (default: false) |
| `is_featured` | ✗ | boolean (default: false) |
| `display_order` | ✗ | integer ≥ 0 (default: 0) |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Client statement created successfully.",
  "statement": { "id": 1, "client_name": "...", "rating": 5, "client": { ... }, ... }
}
```

---

### GET `/api/client-statements` — Public
**List published statements.**

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `is_featured` | boolean — filter featured statements only |
| `client_id` | integer — filter by `our_client_id` |

Ordered by `display_order ASC`, then `created_at DESC`.

**Success Response `200`:**
```json
{
  "success": true,
  "statements": [
    { "id": 1, "client_name": "...", "rating": 5, "statement": "...", "client": { ... }, ... }
  ]
}
```

---

### GET `/api/client-statements/{id}` — Public
**Return a single published statement with linked client info.**

**Error `404`:**
```json
{ "success": false, "message": "Client statement not found." }
```

---

### PUT `/api/client-statements/{id}` 🔒
**Update a statement. All fields optional.**

- If a new `client_image` is uploaded, the old image is deleted from disk.
- If `our_client_id` changes and `company_name` is not explicitly provided, `company_name` is auto-updated from the newly linked client.

---

### DELETE `/api/client-statements/{id}` 🔒
**Soft-delete a statement.** Removed from all public testimonial queries. Record preserved in DB.

---

## 5. Route Summary

| Method | URI | Auth | Controller Method |
|--------|-----|:----:|-------------------|
| `GET` | `/api/client-statements` | Public | `ClientStatementController@index` |
| `GET` | `/api/client-statements/{id}` | Public | `ClientStatementController@show` |
| `POST` | `/api/client-statements` | 🔒 | `ClientStatementController@store` |
| `PUT` | `/api/client-statements/{id}` | 🔒 | `ClientStatementController@update` |
| `DELETE` | `/api/client-statements/{id}` | 🔒 | `ClientStatementController@destroy` |

---

## 6. Key Behaviours

| Behaviour | Implementation |
|-----------|---------------|
| Auto `company_name` | On create/update, if `our_client_id` is provided and `company_name` is omitted, the linked `OurClient.name` is used automatically |
| Rating validation | Enforced as integer between 1 and 5 |
| Client FK on delete | `nullOnDelete()` — testimonial retained with `our_client_id = NULL` when client is deleted |
| Image replacement | Old client image deleted from disk when a new file is uploaded on update |
| Soft-delete | `deleted_at` set; hidden from all public queries |
