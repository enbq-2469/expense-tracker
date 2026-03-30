# Research: Personal Finance Management Web App

**Feature**: `001-personal-finance-web-app`  
**Date**: 2026-03-30  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision Log

### D-001: Full-Stack Framework — Next.js 14 (App Router)

**Decision**: Use Next.js 14 with the App Router as the single monolith for both frontend
pages and backend API.

**Rationale**:

- Route Handlers (`route.ts`) replace the need for a separate Express/FastAPI server,
  minimising infrastructure complexity.
- React Server Components (RSC) allow server-side data fetching without extra API
  round trips for initial page renders.
- Middleware (`middleware.ts`) handles JWT verification and route protection at the
  edge before any page component executes.
- Single `package.json`, single `Dockerfile`, single deployment unit.

**Alternatives considered**:

- **Separate React SPA + Node.js/Express API**: Rejected. Two deployment units, CORS
  configuration required, more moving parts for a single-developer personal app.
- **Remix**: Good alternative but smaller ecosystem; Next.js has broader library
  compatibility.

---

### D-002: Styling — Tailwind CSS v3

**Decision**: Tailwind CSS with a single `tailwind.config.ts` as the design token source.

**Rationale**:

- Utility-first approach enforces the mobile-first breakpoint order (`sm`, `md`, `lg`)
  without requiring a separate token file — the config IS the token file.
- `min-h-[44px]` utility ensures touch targets ≥ 44 px as required by Constitution IV.
- JIT compiler eliminates unused CSS; final CSS bundle < 20 kB for typical pages.

**Alternatives considered**:

- **CSS Modules + SCSS**: More verbose, requires manual responsive utilities.
- **shadcn/ui**: Component library built on Tailwind — can be adopted incrementally
  for UI primitives (Button, Input, Select, Modal) without violating the Tailwind-only rule.

---

### D-003: Database ORM & Migrations — Prisma v5

**Decision**: Prisma ORM for schema definition, type generation, and migration management.

**Rationale**:

- `prisma migrate dev` / `prisma migrate deploy` enforces the constitution rule
  "all schema changes MUST be managed via a migration tool".
- Generated TypeScript types from `schema.prisma` eliminate a class of runtime bugs.
- `prisma/migrations/` directory provides a full audit trail of every schema change.
- Migration `002` can contain raw `INSERT` SQL for master data seeding — no need for
  a separate seed tool.

**Alternatives considered**:

- **Drizzle ORM**: Lighter, but smaller community and fewer integrations.
- **TypeORM**: More verbose, decorator-heavy, worse TypeScript inference.
- **Raw SQL (node-postgres)**: Full control but requires manual type definitions.

---

### D-004: Authentication — JWT in HttpOnly Cookies

**Decision**: JWT access token (15 min) + refresh token (7 days), both stored in
HttpOnly, Secure, SameSite=Lax cookies. No localStorage.

**Rationale**:

- Constitution Principle II: "No localStorage for tokens".
- HttpOnly cookies are inaccessible to JavaScript → XSS cannot steal tokens.
- SameSite=Lax prevents most CSRF vectors while allowing top-level navigation.
- `bcryptjs` (cost 12) for password hashing — aligned with constitution minimum.
- Token refresh is transparent to the user via middleware intercepting 401 responses.

**Alternatives considered**:

- **NextAuth.js**: Abstracts auth but adds complexity and opinionated session handling;
  manual JWT is simpler for this scope.
- **Session cookies (server-side sessions in Redis)**: Valid but requires Redis
  infrastructure; JWT is stateless and needs no additional service.

---

### D-005: Markdown Rendering — markdown-it + DOMPurify

**Decision**: `markdown-it` v14 as parser; `dompurify` v3 as sanitizer; single shared
module at `src/lib/markdown.ts`.

**Rationale**:

- `markdown-it` supports all required features (bold, italic, code blocks, lists,
  blockquotes, links) with a plugin ecosystem for extensions.
- Constitution III: "The Markdown parser MUST be a single shared utility."
- DOMPurify is the most widely used and battle-tested XSS sanitizer in the browser.
  For SSR (server-side rendering), `isomorphic-dompurify` is used to avoid the
  `window` dependency.
- `dangerouslySetInnerHTML` is acceptable ONLY within the `<MarkdownRenderer>`
  component, which always sanitizes first.

**Alternatives considered**:

- **marked.js**: Slightly faster but has had more historical XSS vulnerabilities;
  `markdown-it` has a stricter default security posture.
- **react-markdown**: Higher-level component — good option but relies on remark
  ecosystem; adds dependency weight vs. `markdown-it`.

---

### D-006: Chart Library — Recharts v2

**Decision**: Recharts for pie charts with custom colour-coded legends.

**Rationale**:

- Built on D3 internals but exposes a React-friendly declarative API.
- `<PieChart>`, `<Pie>`, `<Cell>`, `<Legend>`, `<Tooltip>` cover all requirements
  without custom SVG code.
- Tree-shakeable — only chart components used are bundled.
- Responsive via `<ResponsiveContainer width="100%" height={...}>`.

**Alternatives considered**:

- **Chart.js + react-chartjs-2**: Well-established but canvas-based; less composable
  for custom React legend components.
- **Victory**: Smaller community; less maintained.

---

### D-007: Amounts Storage — Integer (VND đồng)

**Decision**: Store amounts as `INT` (PostgreSQL `INTEGER`) representing đồng (VND).

**Rationale**:

- VND does not use decimal subunits in everyday transactions.
- Constitution V: "amounts MUST be stored as integers (minor currency units) to avoid
  floating-point rounding errors."
- `INTEGER` supports values up to ~2.1 billion đồng (≈ $85k USD) per transaction,
  sufficient for personal finance. `BIGINT` is reserved for future bulk/investment amounts.
- Display formatted via `src/lib/currency.ts`: `1500000 → "1.500.000 ₫"`.

---

### D-008: Master Category Seeding — Separate Migration File

**Decision**: A dedicated second migration (`002_seed_system_categories`) inserts
master income and expense categories into a `system_categories` table. On user
registration, the API copies these rows into the user's `categories` table.

**Rationale**:

- User explicitly requested "tạo sẵn dữ liệu master data cho category thu chi bằng
  file migration".
- Keeping master data in a separate, immutable table (`system_categories`) allows the
  seed to be re-applied or extended without touching user data.
- Copying on registration gives each user an independent, editable copy (Constitution V:
  soft-delete allowed per user without affecting other users).

**Master Income categories (5)**:

| #   | Vietnamese    | English            |
| --- | ------------- | ------------------ |
| 1   | Lương         | Salary             |
| 2   | Thưởng        | Bonus              |
| 3   | Đầu tư        | Investment returns |
| 4   | Kinh doanh    | Business income    |
| 5   | Thu nhập khác | Other income       |

**Master Expense categories (10)**:

| #   | Vietnamese         | English           |
| --- | ------------------ | ----------------- |
| 1   | Ăn uống            | Food & Drink      |
| 2   | Đi lại             | Transportation    |
| 3   | Nhà ở              | Housing & Rent    |
| 4   | Mua sắm            | Shopping          |
| 5   | Giải trí           | Entertainment     |
| 6   | Sức khỏe           | Health & Medical  |
| 7   | Giáo dục           | Education         |
| 8   | Hóa đơn & Tiện ích | Bills & Utilities |
| 9   | Tiết kiệm          | Savings           |
| 10  | Chi phí khác       | Other expenses    |

---

### D-009: Transaction List Pagination — Date-Grouped, Page-Based

**Decision**: Transaction list on Import page is grouped by date (newest first) with
simple page-based pagination (20 rows per page).

**Rationale**:

- Spec assumption: "pagination or infinite scroll strategy is left to the implementation
  plan."
- Cursor/infinite scroll adds complexity; page-based pagination is simpler, works well
  on mobile, and is straightforward to implement with Prisma `skip`/`take`.
- 20 rows per page is a standard mobile-friendly page size.
