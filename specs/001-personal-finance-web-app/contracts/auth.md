# API Contracts: Authentication

**Feature**: `001-personal-finance-web-app`  
**Base URL**: `/api/v1/auth`  
**Date**: 2026-03-30

All requests and responses use `Content-Type: application/json`.  
Tokens are NEVER returned in the JSON body — only set as HttpOnly cookies.

---

## POST `/api/v1/auth/register`

Register a new user account.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "mySecurePass123"
}
```

| Field      | Type   | Required | Rules                             |
| ---------- | ------ | -------- | --------------------------------- |
| `email`    | string | ✅       | Valid email format; max 255 chars |
| `password` | string | ✅       | Min 8 characters                  |

### Success — `201 Created`

Sets cookies:

- `at` — access token (HttpOnly, Secure, SameSite=Lax, Max-Age=900)
- `rt` — refresh token (HttpOnly, Secure, SameSite=Lax, Max-Age=604800)

```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "createdAt": "2026-03-30T00:00:00.000Z"
  }
}
```

### Error Responses

| Status | `code`             | Condition                 |
| ------ | ------------------ | ------------------------- |
| `400`  | `VALIDATION_ERROR` | Missing or invalid fields |
| `409`  | `EMAIL_TAKEN`      | Email already registered  |
| `500`  | `INTERNAL_ERROR`   | Unexpected server error   |

```json
{
  "code": "EMAIL_TAKEN",
  "message": "An account with this email already exists."
}
```

---

## POST `/api/v1/auth/login`

Authenticate an existing user.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "mySecurePass123"
}
```

### Success — `200 OK`

Sets the same `at` + `rt` cookies as registration.

```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "createdAt": "2026-03-30T00:00:00.000Z"
  }
}
```

### Error Responses

| Status | `code`                | Condition                                                |
| ------ | --------------------- | -------------------------------------------------------- |
| `400`  | `VALIDATION_ERROR`    | Missing fields                                           |
| `401`  | `INVALID_CREDENTIALS` | Email not found or password mismatch (generic — no hint) |
| `500`  | `INTERNAL_ERROR`      | Unexpected server error                                  |

---

## POST `/api/v1/auth/logout`

End the current session. Requires a valid `at` cookie.

### Request Body

_Empty_

### Success — `200 OK`

Clears `at` and `rt` cookies (sets Max-Age=0).

```json
{ "message": "Logged out successfully." }
```

### Error Responses

| Status | `code`         | Condition                            |
| ------ | -------------- | ------------------------------------ |
| `401`  | `UNAUTHORIZED` | No valid access token cookie present |
