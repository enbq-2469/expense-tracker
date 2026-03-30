# API Contracts: Transactions

**Feature**: `001-personal-finance-web-app`  
**Base URL**: `/api/v1/transactions`  
**Date**: 2026-03-30

All endpoints require a valid `at` (access token) HttpOnly cookie.  
Server enforces `userId` ownership on every query — no cross-user data access is possible.

---

## GET `/api/v1/transactions`

List the authenticated user's transactions, grouped by date, newest first.  
Excludes soft-deleted records (`deletedAt IS NULL`).

### Query Parameters

| Param        | Type                  | Required | Default | Description                |
| ------------ | --------------------- | -------- | ------- | -------------------------- |
| `page`       | integer               | ❌       | `1`     | Page number (1-based)      |
| `pageSize`   | integer               | ❌       | `20`    | Records per page (max 100) |
| `type`       | `INCOME` \| `EXPENSE` | ❌       | —       | Filter by transaction type |
| `categoryId` | string                | ❌       | —       | Filter by category ID      |

### Success — `200 OK`

```json
{
  "data": [
    {
      "id": "cuid...",
      "date": "2026-03-28",
      "note": "**Lương tháng 3**",
      "amountVnd": 15000000,
      "type": "INCOME",
      "category": {
        "id": "cuid...",
        "name": "Lương"
      },
      "createdAt": "2026-03-28T08:00:00.000Z",
      "updatedAt": "2026-03-28T08:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Error Responses

| Status | `code`             | Condition                       |
| ------ | ------------------ | ------------------------------- |
| `401`  | `UNAUTHORIZED`     | Missing or expired access token |
| `400`  | `VALIDATION_ERROR` | Invalid query parameter values  |

---

## POST `/api/v1/transactions`

Create a new transaction for the authenticated user.

### Request Body

```json
{
  "date": "2026-03-30",
  "note": "Tiền ăn sáng **bánh mì**",
  "amountVnd": 35000,
  "type": "EXPENSE",
  "categoryId": "cuid..."
}
```

| Field        | Type                           | Required | Rules                                                      |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------- |
| `date`       | string (ISO date `YYYY-MM-DD`) | ✅       | Valid date; not more than 1 day in the future              |
| `note`       | string                         | ✅       | Max 2000 chars (empty string allowed)                      |
| `amountVnd`  | integer                        | ✅       | > 0                                                        |
| `type`       | `INCOME` \| `EXPENSE`          | ✅       | Must match the category's type                             |
| `categoryId` | string                         | ✅       | Must be an active category owned by the authenticated user |

### Success — `201 Created`

```json
{
  "id": "cuid...",
  "date": "2026-03-30",
  "note": "Tiền ăn sáng **bánh mì**",
  "amountVnd": 35000,
  "type": "EXPENSE",
  "category": {
    "id": "cuid...",
    "name": "Ăn uống"
  },
  "createdAt": "2026-03-30T09:00:00.000Z",
  "updatedAt": "2026-03-30T09:00:00.000Z"
}
```

### Error Responses

| Status | `code`               | Condition                                        |
| ------ | -------------------- | ------------------------------------------------ |
| `401`  | `UNAUTHORIZED`       | Missing or expired access token                  |
| `400`  | `VALIDATION_ERROR`   | Missing required fields or invalid values        |
| `404`  | `CATEGORY_NOT_FOUND` | `categoryId` does not exist or not owned by user |
| `422`  | `TYPE_MISMATCH`      | `type` does not match the category's type        |

---

## PUT `/api/v1/transactions/:id`

Update an existing transaction. All fields are optional — only provided fields are updated.

### Request Body

```json
{
  "date": "2026-03-29",
  "note": "Updated note",
  "amountVnd": 40000,
  "categoryId": "cuid..."
}
```

| Field        | Type              | Required | Rules                                                |
| ------------ | ----------------- | -------- | ---------------------------------------------------- |
| `date`       | string (ISO date) | ❌       | Valid date if provided                               |
| `note`       | string            | ❌       | Max 2000 chars if provided                           |
| `amountVnd`  | integer           | ❌       | > 0 if provided                                      |
| `categoryId` | string            | ❌       | Active category owned by user; type must still match |

### Success — `200 OK`

Returns the full updated transaction object (same shape as POST response).

### Error Responses

| Status | `code`             | Condition                                         |
| ------ | ------------------ | ------------------------------------------------- |
| `401`  | `UNAUTHORIZED`     | Missing or expired access token                   |
| `403`  | `FORBIDDEN`        | Transaction exists but belongs to another user    |
| `404`  | `NOT_FOUND`        | Transaction ID not found or already deleted       |
| `400`  | `VALIDATION_ERROR` | Invalid field values                              |
| `422`  | `TYPE_MISMATCH`    | New category type does not match transaction type |

---

## DELETE `/api/v1/transactions/:id`

Soft-delete a transaction. Sets `deletedAt = now()`.  
The record is retained in the database but excluded from all list and chart queries.

### Request Body

_Empty_

### Success — `200 OK`

```json
{ "message": "Transaction deleted successfully.", "id": "cuid..." }
```

### Error Responses

| Status | `code`         | Condition                                   |
| ------ | -------------- | ------------------------------------------- |
| `401`  | `UNAUTHORIZED` | Missing or expired access token             |
| `403`  | `FORBIDDEN`    | Transaction belongs to another user         |
| `404`  | `NOT_FOUND`    | Transaction ID not found or already deleted |
