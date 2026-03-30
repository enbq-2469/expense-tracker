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

---

## GET `/api/v1/dashboard/monthly`

Return total income and total expense per month for all 12 months of the specified
calendar year. Used to render the monthly grouped bar chart on the Home page (US5, FR-036–FR-041).

### Query Parameters

| Param  | Type   | Required | Values      | Description                                           |
| ------ | ------ | -------- | ----------- | ----------------------------------------------------- |
| `year` | number | ❌       | e.g. `2026` | Calendar year to aggregate. Defaults to current year. |

### Success — `200 OK`

```json
{
  "year": 2026,
  "availableYears": [2025, 2026],
  "months": [
    { "month": 1, "incomeVnd": 15000000, "expenseVnd": 4250000 },
    { "month": 2, "incomeVnd": 12000000, "expenseVnd": 5100000 },
    { "month": 3, "incomeVnd": 16000000, "expenseVnd": 3800000 },
    { "month": 4, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 5, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 6, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 7, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 8, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 9, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 10, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 11, "incomeVnd": 0, "expenseVnd": 0 },
    { "month": 12, "incomeVnd": 0, "expenseVnd": 0 }
  ]
}
```

**Response field notes**:

- `months` always contains exactly **12 entries** (months 1–12) regardless of data
  availability; missing months have `incomeVnd: 0, expenseVnd: 0` (FR-038, FR-039).
- `availableYears` lists every distinct year in which the user has at least one
  non-deleted transaction, always including the current calendar year (FR-037).
  Sorted ascending. Used to populate the year-selector dropdown on the client.
- `year` echoes back the year used for the query (useful when the client sends no param
  and the server defaults to the current year).

### SQL Aggregation (implementation reference)

```sql
-- Generate a complete 12-month spine, then LEFT JOIN actual data
WITH months AS (
    SELECT generate_series(1, 12) AS month
)
SELECT
    m.month,
    COALESCE(SUM(CASE WHEN t.type = 'INCOME'  THEN t.amount_vnd END), 0) AS "incomeVnd",
    COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount_vnd END), 0) AS "expenseVnd"
FROM months m
LEFT JOIN transactions t
    ON  EXTRACT(MONTH FROM t.date) = m.month
    AND EXTRACT(YEAR  FROM t.date) = $year
    AND t.user_id    = $userId
    AND t.deleted_at IS NULL
GROUP BY m.month
ORDER BY m.month;
```

### Error Responses

| Status | `code`             | Condition                                   |
| ------ | ------------------ | ------------------------------------------- |
| `401`  | `UNAUTHORIZED`     | Missing or expired access token             |
| `400`  | `VALIDATION_ERROR` | `year` is not a valid 4-digit calendar year |
