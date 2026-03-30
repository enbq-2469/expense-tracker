# API Contracts: Dashboard

**Feature**: `001-personal-finance-web-app`  
**Base URL**: `/api/v1/dashboard`  
**Date**: 2026-03-30

All endpoints require a valid `at` (access token) HttpOnly cookie.  
Soft-deleted transactions (`deletedAt IS NOT NULL`) are excluded from all aggregations.

---

## GET `/api/v1/dashboard/summary`

Return aggregated income and expense breakdowns by category for the specified time period.  
Used to render both pie charts on the Home page.

### Query Parameters

| Param    | Type   | Required | Values                 | Description                                   |
| -------- | ------ | -------- | ---------------------- | --------------------------------------------- |
| `period` | string | ❌       | `1m`, `3m`, `6m`, `1y` | Time period. Defaults to `1m` (last 30 days). |

**Period definitions** (relative to current server date at query time):

| Value | Date Range                              |
| ----- | --------------------------------------- |
| `1m`  | Last 30 calendar days (today inclusive) |
| `3m`  | Last 90 calendar days                   |
| `6m`  | Last 180 calendar days                  |
| `1y`  | Last 365 calendar days                  |

### Success — `200 OK`

```json
{
  "period": "1m",
  "dateRange": {
    "from": "2026-03-01",
    "to": "2026-03-30"
  },
  "income": {
    "totalVnd": 15000000,
    "byCategory": [
      {
        "categoryId": "cuid...",
        "categoryName": "Lương",
        "amountVnd": 15000000,
        "percentage": 100.0
      }
    ]
  },
  "expense": {
    "totalVnd": 4250000,
    "byCategory": [
      {
        "categoryId": "cuid...",
        "categoryName": "Ăn uống",
        "amountVnd": 2000000,
        "percentage": 47.06
      },
      {
        "categoryId": "cuid...",
        "categoryName": "Đi lại",
        "amountVnd": 1250000,
        "percentage": 29.41
      },
      {
        "categoryId": "cuid...",
        "categoryName": "Giải trí",
        "amountVnd": 1000000,
        "percentage": 23.53
      }
    ]
  }
}
```

**Response field notes**:

- `percentage` is rounded to 2 decimal places; values sum to 100 per type (rounding
  may cause ±0.01 drift which the client should tolerate).
- When there are no transactions for a type in the period, the corresponding object
  has `totalVnd: 0` and `byCategory: []`.
- Categories with `totalVnd = 0` (zero transactions) are **excluded** from `byCategory`.
- `dateRange.from` is inclusive; `dateRange.to` is inclusive (both ISO date strings).

### SQL Aggregation (implementation reference)

```sql
SELECT
    c.id            AS "categoryId",
    c.name          AS "categoryName",
    c.type,
    SUM(t.amount_vnd) AS "amountVnd"
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE
    t.user_id    = $1
    AND t.deleted_at IS NULL
    AND t.date   >= $2   -- period start date
    AND t.date   <= $3   -- period end date (today)
GROUP BY c.id, c.name, c.type
ORDER BY c.type, "amountVnd" DESC;
```

### Error Responses

| Status | `code`             | Condition                                        |
| ------ | ------------------ | ------------------------------------------------ |
| `401`  | `UNAUTHORIZED`     | Missing or expired access token                  |
| `400`  | `VALIDATION_ERROR` | `period` value is not one of the allowed options |
