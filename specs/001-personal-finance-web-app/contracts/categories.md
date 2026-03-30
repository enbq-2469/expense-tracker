# API Contracts: Categories

**Feature**: `001-personal-finance-web-app`  
**Base URL**: `/api/v1/categories`  
**Date**: 2026-03-30

All endpoints require a valid `at` (access token) HttpOnly cookie.  
Categories are user-scoped. System-derived categories (`isSystemDerived: true`) can be
edited and soft-deleted by the user just like user-created ones.

---

## GET `/api/v1/categories`

List all active categories for the authenticated user.

### Query Parameters

| Param  | Type                  | Required | Description                                        |
| ------ | --------------------- | -------- | -------------------------------------------------- |
| `type` | `INCOME` \| `EXPENSE` | ❌       | Filter by category type. If omitted, returns both. |

### Success — `200 OK`

```json
{
  "data": [
    {
      "id": "cuid...",
      "name": "Lương",
      "type": "INCOME",
      "isSystemDerived": true,
      "createdAt": "2026-03-30T00:00:00.000Z"
    },
    {
      "id": "cuid...",
      "name": "Ăn uống",
      "type": "EXPENSE",
      "isSystemDerived": true,
      "createdAt": "2026-03-30T00:00:00.000Z"
    }
  ]
}
```

### Error Responses

| Status | `code`         | Condition                       |
| ------ | -------------- | ------------------------------- |
| `401`  | `UNAUTHORIZED` | Missing or expired access token |

---

## POST `/api/v1/categories`

Create a new user-defined category.

### Request Body

```json
{
  "name": "Freelance",
  "type": "INCOME"
}
```

| Field  | Type                  | Required | Rules                                    |
| ------ | --------------------- | -------- | ---------------------------------------- |
| `name` | string                | ✅       | Non-empty; max 100 chars                 |
| `type` | `INCOME` \| `EXPENSE` | ✅       | Must be one of the two valid enum values |

### Success — `201 Created`

```json
{
  "id": "cuid...",
  "name": "Freelance",
  "type": "INCOME",
  "isSystemDerived": false,
  "createdAt": "2026-03-30T10:00:00.000Z"
}
```

### Error Responses

| Status | `code`               | Condition                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| `401`  | `UNAUTHORIZED`       | Missing or expired access token                                           |
| `400`  | `VALIDATION_ERROR`   | Missing or invalid fields                                                 |
| `409`  | `DUPLICATE_CATEGORY` | An active category with the same name + type already exists for this user |

---

## PUT `/api/v1/categories/:id`

Rename an existing category.

### Request Body

```json
{
  "name": "Freelance Projects"
}
```

| Field  | Type   | Required | Rules                                                                            |
| ------ | ------ | -------- | -------------------------------------------------------------------------------- |
| `name` | string | ✅       | Non-empty; max 100 chars; must not duplicate an active category of the same type |

### Success — `200 OK`

```json
{
  "id": "cuid...",
  "name": "Freelance Projects",
  "type": "INCOME",
  "isSystemDerived": false,
  "updatedAt": "2026-03-30T11:00:00.000Z"
}
```

### Error Responses

| Status | `code`               | Condition                                                        |
| ------ | -------------------- | ---------------------------------------------------------------- |
| `401`  | `UNAUTHORIZED`       | Missing or expired access token                                  |
| `403`  | `FORBIDDEN`          | Category belongs to another user                                 |
| `404`  | `NOT_FOUND`          | Category ID not found or already deleted                         |
| `400`  | `VALIDATION_ERROR`   | Name empty or too long                                           |
| `409`  | `DUPLICATE_CATEGORY` | New name conflicts with another active category of the same type |

---

## DELETE `/api/v1/categories/:id`

Soft-delete a category. Sets `deletedAt = now()`.

**Business rule**: If linked transactions exist, the client MUST request with
`?force=true` after the user explicitly confirms the secondary warning dialog.
Without `?force=true`, the endpoint returns `409 HAS_TRANSACTIONS` so the client
can show the warning with the transaction count.

### Query Parameters

| Param   | Type   | Required | Description                                                |
| ------- | ------ | -------- | ---------------------------------------------------------- |
| `force` | `true` | ❌       | Required to delete a category that has linked transactions |

### Success — `200 OK`

```json
{
  "message": "Category deleted successfully.",
  "id": "cuid...",
  "linkedTransactionsCount": 0
}
```

### Error Responses

| Status | `code`             | Condition                                                       |
| ------ | ------------------ | --------------------------------------------------------------- |
| `401`  | `UNAUTHORIZED`     | Missing or expired access token                                 |
| `403`  | `FORBIDDEN`        | Category belongs to another user                                |
| `404`  | `NOT_FOUND`        | Category ID not found or already deleted                        |
| `409`  | `HAS_TRANSACTIONS` | Category has linked transactions and `?force=true` not provided |

```json
{
  "code": "HAS_TRANSACTIONS",
  "message": "This category has 12 linked transaction(s). Pass ?force=true to confirm deletion.",
  "linkedTransactionsCount": 12
}
```
