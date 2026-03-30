# Tasks: Personal Finance Management Web App

**Input**: Design documents from `/specs/001-personal-finance-web-app/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js 14 monorepo with all required tooling and configuration.

- [x] T001 Initialize Next.js 14 project with TypeScript: run `pnpm create next-app@14 . --typescript --app --no-src-dir --import-alias "@/*"` then move files to `src/` structure per plan
- [x] T002 Install all production dependencies in `package.json`: `next@14`, `react@18`, `react-dom@18`, `@prisma/client@5`, `prisma@5`, `bcryptjs`, `jose`, `markdown-it`, `isomorphic-dompurify`, `recharts`, `zod`, `@types/bcryptjs`, `@types/markdown-it`
- [x] T003 [P] Configure `tailwind.config.ts` with content paths `./src/**/*.{ts,tsx}`, theme extension for custom colours (income green `#16a34a`, expense red `#dc2626`), and min-touch-target utilities
- [x] T004 [P] Configure `next.config.ts`: enable strict mode, set `images.formats: ['image/webp','image/avif']`, add security headers (X-Frame-Options, X-Content-Type-Options, CSP)
- [x] T005 [P] Configure `tsconfig.json`: strict mode, path aliases `@/*` → `./src/*`, target ES2020
- [x] T006 [P] Create `docker-compose.yml` at repo root with `postgres:16-alpine` service, env vars `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, port `5432:5432`, named volume `pg_data`
- [x] T007 [P] Create `.env.example` with `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_APP_URL`; create `.gitignore` including `.env`, `node_modules/`, `.next/`
- [x] T008 [P] Create `src/app/globals.css` with Tailwind directives (`@tailwind base/components/utilities`) and CSS custom properties for colour tokens

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, shared libraries, and middleware that ALL user stories depend on. No US work begins until this phase is complete.

**⚠️ CRITICAL**: Complete T009–T024 before any Phase 3+ task.

### 2a — Prisma Schema & Migrations

- [x] T009 Create `prisma/schema.prisma` with `generator client`, `datasource db` (PostgreSQL), enum `CategoryType {INCOME EXPENSE}`, and models `User`, `SystemCategory`, `Category`, `Transaction` exactly as defined in `data-model.md`
- [x] T010 Create `prisma/migrations/20260330000001_init_schema/migration.sql`: DDL for `users`, `system_categories`, `categories`, `transactions` tables including CHECK constraint `amount_vnd > 0`, partial unique index on categories (WHERE `deleted_at IS NULL`), all foreign keys and indexes per `data-model.md`
- [x] T011 Create `prisma/migrations/20260330000002_seed_system_categories/migration.sql`: INSERT 5 INCOME categories (Lương, Thưởng, Đầu tư, Kinh doanh, Thu nhập khác) and 10 EXPENSE categories (Ăn uống, Đi lại, Nhà ở, Mua sắm, Giải trí, Sức khỏe, Giáo dục, Hóa đơn & Tiện ích, Tiết kiệm, Chi phí khác) into `system_categories` using `gen_random_uuid()` per `data-model.md`

### 2b — Core Library Modules

- [x] T012 [P] Create `src/lib/db.ts`: Prisma client singleton with global instance guard (`globalThis.__prisma`) to prevent multiple instances in dev hot-reload
- [x] T013 [P] Create `src/lib/auth.ts`: JWT helpers using `jose` — `signAccessToken(userId)` (15 min, HS256), `signRefreshToken(userId)` (7 days, HS256), `verifyAccessToken(token)`, `setAuthCookies(response, userId)`, `clearAuthCookies(response)` — all cookies HttpOnly, Secure, SameSite=Lax
- [x] T014 [P] Create `src/lib/markdown.ts`: single `markdown-it` instance configured with `{ html: false, linkify: true, typographer: true }`, export `renderMarkdown(input: string): string` which pipes through `isomorphic-dompurify.sanitize()` before returning
- [x] T015 [P] Create `src/lib/currency.ts`: export `formatVnd(amount: number): string` formatting integer đồng as `"1.500.000 ₫"` (Vietnamese locale, no decimals), and `parseVnd(input: string): number` for form input parsing
- [x] T016 [P] Create `src/lib/api-client.ts`: fetch wrapper that sets `credentials: 'include'`, base URL from `NEXT_PUBLIC_APP_URL`, returns typed JSON, throws `ApiError` with `{ code, message, status }` on non-2xx responses

### 2c — Validation Schemas

- [x] T017 [P] Create `src/lib/validations/auth.schema.ts`: Zod schemas `registerSchema` (`email` valid format max 255, `password` min 8) and `loginSchema` (same fields, no min check on password for login)
- [x] T018 [P] Create `src/lib/validations/transaction.schema.ts`: Zod schema `createTransactionSchema` (`date` ISO string, `note` max 2000, `amountVnd` int > 0, `type` enum, `categoryId` non-empty string) and `updateTransactionSchema` (all fields optional)
- [x] T019 [P] Create `src/lib/validations/category.schema.ts`: Zod schema `createCategorySchema` (`name` non-empty max 100, `type` enum) and `updateCategorySchema` (`name` only)

### 2d — Shared TypeScript Types

- [x] T020 [P] Create `src/types/index.ts`: TypeScript interfaces `UserPublic`, `CategoryDTO`, `TransactionDTO`, `TransactionListResponse`, `DashboardSummary`, `ApiError`, `PeriodOption` — derived from Prisma types and contract shapes in `contracts/*.md`

### 2e — Next.js Middleware (Auth Guard)

- [x] T021 Create `src/middleware.ts`: Next.js middleware that reads the `at` (access token) cookie, calls `verifyAccessToken()`, and on failure redirects to `/login`; protected routes matcher: `['/home', '/import', '/settings']`; also redirect authenticated users away from `/login` and `/signup` to `/home`

### 2f — Root Layout & App Shell

- [x] T022 Create `src/app/layout.tsx`: root layout with `<html lang="vi">`, import `globals.css`, set metadata (`title: 'Expense Tracker'`, `description`, `viewport` for mobile), wrap children in a minimal shell `<body>` with Tailwind base classes
- [x] T023 Create `src/app/page.tsx`: root page that immediately redirects to `/login` (server component using `redirect()` from `next/navigation`)

**Checkpoint**: Foundation complete — all user story phases can now begin.

---

## Phase 3: User Story 1 — Account Registration & Login (Priority: P1) 🎯 MVP

**Goal**: A visitor can create an account and log in, establishing an authenticated session. All other pages become accessible.

**Independent Test**: Navigate to `/signup` → submit valid email + password → confirm redirect to `/home` → navigate to `/login` → log out → log back in → confirm landing on `/home`.

### 3a — API Route Handlers

- [x] T024 [US1] Create `src/app/api/v1/auth/register/route.ts`: POST handler — validate body with `registerSchema`, check email uniqueness (return 409 `EMAIL_TAKEN` if taken), hash password with `bcryptjs` (cost 12), create `User` record in Prisma transaction, copy `system_categories` to user's `categories` via `$executeRaw` (per `data-model.md` registration seed query), call `setAuthCookies()`, return 201 with `UserPublic`
- [x] T025 [US1] Create `src/app/api/v1/auth/login/route.ts`: POST handler — validate body with `loginSchema`, fetch user by email, compare password with `bcrypt.compare()`, on mismatch return 401 `INVALID_CREDENTIALS` (generic message), call `setAuthCookies()`, return 200 with `UserPublic`
- [x] T026 [US1] Create `src/app/api/v1/auth/logout/route.ts`: POST handler — verify `at` cookie present (401 if missing), call `clearAuthCookies()`, return 200

### 3b — UI Components (Auth-specific)

- [x] T027 [P] [US1] Create `src/components/ui/Button.tsx`: reusable button with variants `primary | secondary | danger`, `loading` state (spinner), `disabled` state, `min-h-[44px]` for touch targets, full-width option
- [x] T028 [P] [US1] Create `src/components/ui/Input.tsx`: reusable text/email/password input with `label`, `error` message display, `required` indicator, full-width, Tailwind focus ring
- [x] T029 [P] [US1] Create `src/components/auth/SignUpForm.tsx`: client component — form with Email Input, Password Input, inline Zod validation on blur, submit calls `POST /api/v1/auth/register` via `api-client.ts`, on success `router.push('/home')`, on 409 shows "Email đã tồn tại", on 400 shows field errors
- [x] T030 [P] [US1] Create `src/components/auth/LoginForm.tsx`: client component — form with Email Input, Password Input, submit calls `POST /api/v1/auth/login`, on success `router.push('/home')`, on 401 shows generic error "Email hoặc mật khẩu không đúng"

### 3c — Pages

- [x] T031 [US1] Create `src/app/(auth)/signup/page.tsx`: server page — title "Đăng ký", centered card layout, renders `<SignUpForm />`, link to `/login`; if authenticated already → `redirect('/home')`
- [x] T032 [US1] Create `src/app/(auth)/login/page.tsx`: server page — title "Đăng nhập", centered card layout, renders `<LoginForm />`, link to `/signup`; if authenticated already → `redirect('/home')`

---

## Phase 4: User Story 2 — Manage Transactions (Import Page) (Priority: P2)

**Goal**: Authenticated user can add, edit, and delete income/expense transactions. List updates without page reload.

**Independent Test**: Log in → `/import` → Add 1 Income + 1 Expense → Edit the Income entry → Delete the Expense → verify list reflects all 3 changes immediately without full reload.

**Dependency**: US1 (authentication) must be complete.

### 4a — API Route Handlers

- [x] T033 [US2] Create `src/app/api/v1/transactions/route.ts`: GET — query user's transactions `WHERE deleted_at IS NULL AND user_id = $userId` ordered by `date DESC`, support `page`/`pageSize`/`type`/`categoryId` query params, return `TransactionListResponse` shape per contract; POST — validate with `createTransactionSchema`, verify `categoryId` belongs to user and not deleted, verify `type` matches category type (422 `TYPE_MISMATCH`), create record, return 201
- [x] T034 [US2] Create `src/app/api/v1/transactions/[id]/route.ts`: PUT — find transaction by id and `userId` (403/404 guards), validate partial update with `updateTransactionSchema`, if `categoryId` provided re-verify ownership + type match, update record, return 200; DELETE — find transaction (403/404 guards), set `deletedAt = new Date()`, return 200

### 4b — UI Components (Transaction-specific)

- [x] T035 [P] [US2] Create `src/components/ui/Modal.tsx`: reusable modal overlay — `isOpen`, `onClose`, `title`, `children` props; trap focus inside modal; close on Escape key; backdrop click closes; accessible `role="dialog"` with `aria-modal`
- [x] T036 [P] [US2] Create `src/components/ui/Select.tsx`: reusable `<select>` wrapper with `label`, `options: {value, label}[]`, `error`, `min-h-[44px]`, full-width
- [x] T037 [P] [US2] Create `src/components/ui/ConfirmDialog.tsx`: modal variant — `isOpen`, `title`, `message`, `onConfirm`, `onCancel`, danger-style Confirm button and neutral Cancel button, min 44px touch targets
- [x] T038 [P] [US2] Create `src/components/ui/MarkdownRenderer.tsx`: client component — accepts `source: string`, calls `renderMarkdown()` from `src/lib/markdown.ts`, renders via `dangerouslySetInnerHTML`, wraps in `<div className="prose prose-sm max-w-none">`
- [x] T039 [US2] Create `src/components/transactions/TransactionModal.tsx`: client component — used for both Add and Edit modes; fields: DatePicker (native `<input type="date">` defaulting to today), Note (`<Input>` with live Markdown preview toggle), Amount (`<Input type="number">`), Type (`<Select>` INCOME/EXPENSE), Category (`<Select>` filtered by selected Type, fetched from `/api/v1/categories?type=`); Cancel + Save buttons; client-side Zod validation before submit; calls POST or PUT via `api-client.ts`; on success calls `onSave()` callback
- [x] T040 [US2] Create `src/components/transactions/TransactionRow.tsx`: renders one table row — columns: date (formatted `dd/MM/yyyy`), note (`<MarkdownRenderer>`), amount (colour-coded: INCOME green, EXPENSE red, formatted with `formatVnd`), type badge, category name, Edit icon button, Delete icon button; `min-h-[44px]` on action buttons
- [x] T041 [US2] Create `src/components/transactions/TransactionList.tsx`: client component — groups `TransactionDTO[]` by date, renders date group headers + `<TransactionRow>` for each; handles empty state ("Chưa có giao dịch nào"); renders `<TransactionModal>` for Add/Edit; renders `<ConfirmDialog>` for Delete; on CRUD success re-fetches list via `useTransactions` hook; pagination controls (Prev/Next) when `totalPages > 1`

### 4c — Custom Hook

- [x] T042 [US2] Create `src/hooks/useTransactions.ts`: `useTransactions(params)` hook — fetches `GET /api/v1/transactions` with given params, manages `data`, `loading`, `error` state; exposes `refetch()`, `createTransaction(payload)`, `updateTransaction(id, payload)`, `deleteTransaction(id)` actions that call the API then `refetch()` on success

### 4d — Page

- [x] T043 [US2] Create `src/app/(dashboard)/import/page.tsx`: client page — renders "Add" button at top (opens `<TransactionModal>` in create mode), renders `<TransactionList>` below with data from `useTransactions`; responsive: full-width on mobile, max-w-5xl centered on desktop

---

## Phase 5: User Story 3 — Dashboard Overview (Home Page) (Priority: P3)

**Goal**: Authenticated user sees income and expense pie charts filtered by time period (1M/3M/6M/1Y).

**Independent Test**: Log in → `/home` → confirm charts load for 1 Month → switch to 3 Months → confirm charts update without full reload → verify empty state when no data.

**Dependency**: US2 transactions must exist for meaningful chart data (seed data acceptable for testing).

### 5a — API Route Handler

- [x] T044 [US3] Create `src/app/api/v1/dashboard/summary/route.ts`: GET — read `period` query param (`1m`|`3m`|`6m`|`1y`, default `1m`), compute `dateFrom`/`dateTo`, run aggregation SQL per `contracts/dashboard.md` (GROUP BY category, SUM amount_vnd, WHERE deleted_at IS NULL), compute percentages, return `DashboardSummary` shape; return `byCategory: []` when no data

### 5b — UI Components (Chart-specific)

- [x] T045 [P] [US3] Create `src/components/ui/Select.tsx` (already exists from T036 — reuse); create `src/components/charts/PeriodSelector.tsx`: client component — `<Select>` with options `[{value:'1m',label:'1 Tháng'},{value:'3m',label:'3 Tháng'},{value:'6m',label:'6 Tháng'},{value:'1y',label:'1 Năm'}]`, default `'1m'`, calls `onChange(period)` prop
- [x] T046 [P] [US3] Create `src/components/charts/ExpensePieChart.tsx`: client component using Recharts `<ResponsiveContainer>` + `<PieChart>` + `<Pie>` + `<Cell>` + `<Tooltip>`; accepts `data: { categoryName, amountVnd, percentage }[]`; uses 10-colour palette from `tailwind.config.ts`; renders empty state div when `data.length === 0`
- [x] T047 [P] [US3] Create `src/components/charts/ChartLegend.tsx`: renders colour-coded legend list — each item: colour dot + category name + percentage + formatted VND amount; responsive: wraps on small viewports

### 5c — Custom Hook

- [x] T048 [US3] Create `src/hooks/useDashboard.ts`: `useDashboard(period)` hook — fetches `GET /api/v1/dashboard/summary?period=` on period change, manages `data`, `loading`, `error` state

### 5d — Page

- [x] T049 [US3] Create `src/app/(dashboard)/home/page.tsx`: client page — renders `<PeriodSelector>` at top; below: responsive 2-column grid (stacks vertically on mobile via `flex-col md:flex-row`); left: "Thu nhập" heading + `<ExpensePieChart>` with income data + `<ChartLegend>`; right: "Chi tiêu" heading + `<ExpensePieChart>` with expense data + `<ChartLegend>`; data from `useDashboard(selectedPeriod)`; shows skeleton loader while loading

---

## Phase 6: User Story 4 — Manage Categories (Settings Page) (Priority: P4)

**Goal**: Authenticated user can add, rename, and delete Income and Expense categories. Changes propagate immediately to Import page dropdowns.

**Independent Test**: Log in → `/settings` → Add new "Freelance" Income category → go to `/import` → open Add popup → verify "Freelance" appears in Category dropdown → return to `/settings` → rename it → delete it → verify it's gone from dropdown.

**Dependency**: US1 (authentication). US2 recommended but not strictly required.

### 6a — API Route Handlers

- [x] T050 [US4] Create `src/app/api/v1/categories/route.ts`: GET — return user's categories `WHERE deleted_at IS NULL AND user_id = $userId`, optionally filtered by `type` query param, ordered by type then name; POST — validate with `createCategorySchema`, check duplicate (name+type+userId WHERE deleted_at IS NULL → 409 `DUPLICATE_CATEGORY`), create record, return 201
- [x] T051 [US4] Create `src/app/api/v1/categories/[id]/route.ts`: PUT — find by id+userId (403/404), validate with `updateCategorySchema`, check duplicate name for same type (409), update, return 200; DELETE — find by id+userId (403/404), count linked transactions (`WHERE category_id = id AND deleted_at IS NULL`), if count > 0 and `?force` not provided return 409 `HAS_TRANSACTIONS` with count, else set `deletedAt = new Date()`, return 200

### 6b — UI Components (Category-specific)

- [x] T052 [P] [US4] Create `src/components/categories/CategoryModal.tsx`: client component — Add/Edit modal; single `name` text `<Input>` field; Cancel + Save buttons; Zod validation; calls POST or PUT via `api-client.ts`; on success calls `onSave()` callback
- [x] T053 [P] [US4] Create `src/components/categories/CategoryItem.tsx`: renders one category row — category name, Edit icon button, Delete icon button; `min-h-[44px]`; on Edit opens `<CategoryModal>` pre-filled; on Delete triggers `<ConfirmDialog>` (or `<HAS_TRANSACTIONS>` warning variant showing linked count with secondary confirm)
- [x] T054 [US4] Create `src/components/categories/CategoryList.tsx`: client component — accepts `type: 'INCOME' | 'EXPENSE'`, renders section heading ("Thu nhập" or "Chi tiêu"), "Thêm" button, list of `<CategoryItem>`; uses `useCategories` hook; empty state when no categories

### 6c — Custom Hook

- [x] T055 [US4] Create `src/hooks/useCategories.ts`: `useCategories(type?)` hook — fetches `GET /api/v1/categories?type=` on mount, exposes `data`, `loading`, `error`, `createCategory(payload)`, `updateCategory(id, payload)`, `deleteCategory(id, force?)` actions that call API then `refetch()`

### 6d — Page

- [x] T056 [US4] Create `src/app/(dashboard)/settings/page.tsx`: client page — heading "Cài đặt danh mục"; renders two `<CategoryList>` side by side on desktop, stacked on mobile (`flex-col md:flex-row gap-6`): one for INCOME, one for EXPENSE

---

## Phase 7: Authenticated Layout & Navigation

**Purpose**: Shared layout with nav bar for all dashboard pages.

- [x] T057 Create `src/app/(dashboard)/layout.tsx`: wraps all authenticated pages — renders `<NavBar>` at top, `<main>` with padding below; reads user info from JWT cookie server-side for display
- [x] T058 [P] Create `src/components/ui/NavBar.tsx`: responsive nav bar — app name/logo on left; nav links (Home `/home`, Import `/import`, Settings `/settings`) as `<Link>` components; "Đăng xuất" button on right that calls `POST /api/v1/auth/logout` then `router.push('/login')`; mobile: hamburger menu or bottom-fixed tab bar via Tailwind responsive classes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, loading states, accessibility, responsive hardening.

- [x] T059 [P] Create `src/app/error.tsx` and `src/app/(dashboard)/error.tsx`: Next.js error boundaries — generic "Đã xảy ra lỗi" UI with retry button
- [x] T060 [P] Create `src/app/not-found.tsx`: 404 page — friendly message with link back to `/home`
- [x] T061 [P] Add loading skeletons: `src/app/(dashboard)/home/loading.tsx` (two pie chart placeholders), `src/app/(dashboard)/import/loading.tsx` (table skeleton), `src/app/(dashboard)/settings/loading.tsx` (list skeleton)
- [x] T062 [P] Accessibility audit: verify all interactive elements have `aria-label` or visible text, all form inputs have associated `<label>`, focus ring visible in `tailwind.config.ts` (`ring` utilities), colour contrast ≥ 4.5:1 for text elements
- [x] T063 [P] Responsive verification: test all pages at 320px, 375px, 768px, 1024px, 1280px viewport widths — fix any horizontal overflow, ensure table on `/import` is horizontally scrollable on mobile with `overflow-x-auto` wrapper
- [x] T064 [P] Create `src/app/api/v1/auth/refresh/route.ts`: POST handler — reads `rt` cookie, verifies refresh token, issues new `at` cookie (silent token refresh); update `api-client.ts` to retry once on 401 by hitting `/api/v1/auth/refresh` then replaying the original request

---

## Phase 9: User Story 5 — Monthly Bar Chart (Home Page) (Priority: P3)

**Goal**: Authenticated user sees a 12-month grouped bar chart on the Home page showing total income (green) and total expense (red) per month for a chosen year. Includes a year-selector dropdown.

**Independent Test**: Log in → `/home` → scroll to bar chart → confirm 12 month groups render → switch year in dropdown → confirm chart updates without full reload → verify months with no data show zero-height bars → hover a bar → confirm tooltip shows month, type, amount.

**Dependency**: US2 transactions must exist for meaningful data (seed data acceptable). US3 (pie charts) must be implemented first as this extends the same Home page.

### 9a — Shared Types (already added to `src/types/index.ts`)

- [x] T065 [P] [US5] Add `MonthlyDataPoint` and `MonthlyChartResponse` interfaces to `src/types/index.ts` per `contracts/dashboard.md` monthly endpoint: `MonthlyDataPoint { month: number; incomeVnd: number; expenseVnd: number }`, `MonthlyChartResponse { year: number; availableYears: number[]; months: MonthlyDataPoint[] }`

### 9b — API Route Handler

- [x] T066 [US5] Create `src/app/api/v1/dashboard/monthly/route.ts`: GET — read `year` query param (integer, default current calendar year, 400 if non-numeric), use `generate_series(1,12)` LEFT JOIN with transactions to guarantee 12 rows always returned, `COALESCE(SUM(CASE WHEN type='INCOME' THEN amount_vnd END),0)` and same for EXPENSE, also query distinct years with any non-deleted transactions to build `availableYears` (always include current year), return `MonthlyChartResponse` shape per `contracts/dashboard.md`

### 9c — UI Components (Bar chart-specific)

- [x] T067 [P] [US5] Create `src/components/charts/YearSelector.tsx`: client component — accepts `value: number`, `availableYears: number[]`, `onChange: (year: number) => void`; renders a `<Select>` with options built from `availableYears` sorted descending; accessible label "Năm thống kê"
- [x] T068 [P] [US5] Create `src/components/charts/MonthlyBarChart.tsx`: client component using Recharts — `<ResponsiveContainer width="100%" height={320}>` wrapping `<BarChart data={months}>` where each data point has keys `incomeVnd` and `expenseVnd`; `<XAxis dataKey="month" tickFormatter={(m) => 'Th.'+m} />`; `<YAxis tickFormatter={formatVndShort} width={80} />`; `<CartesianGrid strokeDasharray="3 3" />`; two `<Bar>` elements: income (`dataKey="incomeVnd"`, fill `#16a34a`, name "Thu nhập") and expense (`dataKey="expenseVnd"`, fill `#dc2626`, name "Chi tiêu"); `<Tooltip formatter={(v) => formatVnd(v)} labelFormatter={(m) => 'Tháng '+m} />`; `<Legend />`; renders empty-state note when all incomeVnd and expenseVnd are 0

### 9d — Custom Hook

- [x] T069 [US5] Create `src/hooks/useMonthlyChart.ts`: `useMonthlyChart(year: number)` hook — fetches `GET /api/v1/dashboard/monthly?year=` when `year` changes, manages `data: MonthlyChartResponse | null`, `loading`, `error` state, exposes `refetch()`

### 9e — Page Update

- [x] T070 [US5] Update `src/app/(dashboard)/home/page.tsx`: add second state variable `selectedYear` (number, default `new Date().getFullYear()`); add `useMonthlyChart(selectedYear)` call; below the existing pie chart grid, add a new section with heading "Thu chi theo tháng", `<YearSelector>` on the right, and `<MonthlyBarChart>` spanning full width; show skeleton `<Skeleton className="h-80 rounded-xl" />` while loading; update `src/app/(dashboard)/home/loading.tsx` to include a bar chart skeleton below the pie chart skeletons

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup)
    └──▶ Phase 2 (Foundational — BLOCKING)
              ├──▶ Phase 3 (US1: Auth) ← MVP — deliver first
              │         └──▶ Phase 4 (US2: Transactions) ← requires US1
              │                   └──▶ Phase 5 (US3: Dashboard — Pie Charts) ← requires US2 data
              │                             ├──▶ Phase 9 (US5: Monthly Bar Chart) ← extends US3 home page
              │                             └──▶ Phase 6 (US4: Categories) ← requires US1
              └──▶ Phase 7 (Nav Layout) ← can begin after US1 pages exist
                        └──▶ Phase 8 (Polish) ← final pass
```

## Parallel Execution Opportunities

| Story Phase | Tasks that can run in parallel (different files)                                        |
| ----------- | --------------------------------------------------------------------------------------- |
| Phase 1     | T003, T004, T005, T006, T007, T008 — all config files are independent                   |
| Phase 2b–2e | T012–T020 — all separate `src/lib/` modules                                             |
| Phase 3b    | T027, T028, T029, T030 — independent component files                                    |
| Phase 4b    | T035, T036, T037, T038 — independent UI components                                      |
| Phase 4b–4c | T039, T040, T042 — TransactionModal, TransactionRow, and hook are independent           |
| Phase 5b    | T045, T046, T047 — all chart components independent                                     |
| Phase 6b    | T052, T053 — CategoryModal and CategoryItem independent                                 |
| Phase 8     | T059, T060, T061, T062, T063, T064 — all polish tasks independent                       |
| Phase 9b–9d | T066, T067, T068, T069 — API route, YearSelector, MonthlyBarChart, hook are independent |

## Implementation Strategy (MVP First)

| Increment | Phases    | Deliverable                                                 |
| --------- | --------- | ----------------------------------------------------------- |
| MVP       | 1 + 2 + 3 | Working app: sign up, log in, log out, auth-protected shell |
| v0.2      | + 4       | Add/Edit/Delete transactions                                |
| v0.3      | + 5       | Home dashboard with pie charts                              |
| v0.4      | + 6 + 7   | Category management + full nav bar                          |
| v0.5      | + 9       | Monthly bar chart with year selector                        |
| v1.0      | + 8       | Polish, error boundaries, token refresh, accessibility      |

**Total tasks**: 70  
**Parallelizable tasks**: 39 marked with [P]  
**User story tasks**: US1 × 9 | US2 × 11 | US3 × 6 | US4 × 7 | US5 × 6
