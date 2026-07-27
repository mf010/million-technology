Frontend Handoff: Authentication & User Management Specification
1. General API & Security Context
Base URL: http://localhost:8000/api
Content-Type: application/json
Authentication Method: JSON Web Tokens (JWT) via tymon/jwt-auth.
State Management: Stateless. The frontend must store the JWT token (e.g., in localStorage, sessionStorage, or a secure cookie) and send it with all protected requests.
Request Header for Protected Endpoints:
http
Authorization: Bearer <your_jwt_token>
2. Default Test User Credentials
You can use the following seeded account to test the login flow immediately:

Email: mohammedfurrara1@gmail.com
Password: password
3. API Reference (Auth & User Endpoints)
3.1 Register New User
Endpoint: POST /api/auth/register
Security: Public (No token required)
Request Body:
json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secretpassword123",
  "password_confirmation": "secretpassword123"
}
Success Response (201 Created):
json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-07-12T14:15:00.000000Z",
    "updated_at": "2026-07-12T14:15:00.000000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 3600
}
Error Response (422 Unprocessable Content):
json
{
  "success": false,
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password field confirmation does not match."]
  }
}
3.2 Login
Endpoint: POST /api/auth/login
Security: Public (No token required)
Request Body:
json
{
  "email": "mohammedfurrara1@gmail.com",
  "password": "password"
}
Success Response (200 OK):
json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 3600
}
Error Response (401 Unauthorized):
json
{
  "success": false,
  "message": "Invalid email or password."
}
3.3 Logout
Endpoint: POST /api/auth/logout
Security: 🔒 Authenticated (Requires token)
Description: Invalidates and blacklists the current JWT on the server-side.
Success Response (200 OK):
json
{
  "success": true,
  "message": "Logged out successfully."
}
3.4 Get Current Authenticated User (Me)
Endpoint: GET /api/auth/me
Security: 🔒 Authenticated (Requires token)
Success Response (200 OK):
json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "mohammed",
    "email": "mohammedfurrara1@gmail.com",
    "email_verified_at": null,
    "created_at": "2026-07-11T13:38:26.000000Z",
    "updated_at": "2026-07-11T13:38:26.000000Z"
  }
}
3.5 Change Password
Endpoint: PUT /api/auth/change-password
Security: 🔒 Authenticated (Requires token)
Request Body:
json
{
  "current_password": "password",
  "new_password": "newsecurepassword123",
  "new_password_confirmation": "newsecurepassword123"
}
Success Response (200 OK):
json
{
  "success": true,
  "message": "Password changed successfully."
}
Error Response (422 Unprocessable Content):
json
{
  "success": false,
  "message": "Current password is incorrect."
}
3.6 Delete User Account
Endpoint: DELETE /api/auth/delete
Security: 🔒 Authenticated (Requires token)
Description: Permanently deletes the logged-in user from the database and invalidates their token.
Success Response (200 OK):
json
{
  "success": true,
  "message": "Account deleted successfully."
}
4. Frontend Integration Tips
Token Expiry Management: The token payload returns an expires_in field containing the token life in seconds (typically 3600 seconds / 1 hour). The frontend should clear the token state or refresh it when this time window is close to expiring.
Handling 401 Unauthorized: If any authenticated request returns 401 Unauthorized, the frontend must immediately wipe local authentication data (stored tokens) and redirect the user back to the /login route.