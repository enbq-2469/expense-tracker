<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial fill from template)

Modified principles: N/A (first population)

Added sections:
  - Core Principles (I–V)
  - Technology Stack & Security Constraints
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  ✅ .specify/templates/constitution-template.md — source template; no change needed
  ✅ .specify/templates/plan-template.md — Constitution Check aligns with principles I–V
  ✅ .specify/templates/spec-template.md — User Scenarios structure compatible; no conflict
  ✅ .specify/templates/tasks-template.md — Phase structure aligns with Auth-First + API-Contract workflow

Follow-up TODOs: None; all placeholders resolved.
-->

# Expense Tracker Constitution

## Core Principles

### I. Dynamic-First & API-Driven (NON-NEGOTIABLE)

The application MUST be a fully dynamic web application backed by a persistent data layer.

- All user financial data (transactions, categories, budgets) MUST be persisted in a
  server-side database; client-side-only storage (localStorage, IndexedDB) is PROHIBITED
  as the primary data store.
- The frontend MUST communicate with the backend exclusively through a versioned REST
  or GraphQL API; direct database access from the browser is PROHIBITED.
- All API endpoints MUST be versioned (e.g., `/api/v1/...`) from the first release to
  allow non-breaking evolution.
- Real-time or near-real-time data updates (e.g., balance refresh after a transaction)
  MUST be supported via API polling or WebSocket/SSE — stale UI state is not acceptable.

**Rationale**: Financial data is sensitive and stateful; a server-backed architecture
ensures consistency, auditability, and multi-device access.

### II. Authentication & Data Isolation (NON-NEGOTIABLE)

Every request that accesses or mutates user data MUST be authenticated and authorized.

- Authentication MUST use token-based sessions (JWT or equivalent); passwords MUST be
  hashed with bcrypt (cost ≥ 12) or Argon2 before storage.
- Each user MUST only be able to read or modify their own data; server-side ownership
  checks are MANDATORY on every data-access endpoint — client-side guards alone are
  INSUFFICIENT.
- Sensitive fields (passwords, tokens) MUST NEVER appear in API responses, logs, or
  error messages.
- HTTPS MUST be enforced in all environments except local development (`localhost`).

**Rationale**: Personal finance data is among the most privacy-sensitive categories;
a breach or data leak is unacceptable and must be prevented at the architecture level.

### III. Markdown-Driven Notes & Descriptions

All user-authored textual content (transaction notes, budget descriptions, category
descriptions) MUST support Markdown input and rendered output.

- Markdown MUST be rendered safely: user-supplied HTML MUST be sanitized (e.g., via
  DOMPurify or a server-side sanitizer) before display; raw `<script>` or event
  handlers injected through Markdown are PROHIBITED.
- Supported Markdown features MUST include: bold/italic, inline code, fenced code blocks,
  blockquotes, ordered/unordered lists, and links.
- The Markdown parser MUST be a single shared utility; duplicated parser instances in
  different components are PROHIBITED.
- Markdown preview MUST be available inline (live preview or toggled) in all note/
  description input fields.

**Rationale**: Rich text notes improve usability for personal finance tracking without
coupling content to a proprietary editor format.

### IV. Responsive & Mobile-First UI

All UI views MUST be designed mobile-first and render correctly across standard viewports.

- Layouts MUST use CSS Grid or Flexbox with relative units (`%`, `rem`, `vw`/`vh`);
  fixed-pixel container widths are PROHIBITED.
- The application MUST be fully functional at viewport widths from 320 px to 1920 px+.
- Breakpoints MUST be defined in a single shared CSS token/variable file; ad-hoc
  magic numbers in component styles are PROHIBITED.
- Touch targets (buttons, form controls) MUST be at least 44 × 44 px on mobile viewports.
- Financial data tables (transaction lists, reports) MUST adapt gracefully on small
  screens: horizontal scrolling with sticky first column OR a card-list view is required.

**Rationale**: Users track expenses on the go; a mobile-first interface ensures the
primary use case is first-class, not retrofitted.

### V. Data Integrity & Auditability

Financial data mutations MUST be traceable and recoverable.

- Every transaction record MUST store `created_at` and `updated_at` timestamps managed
  by the server; client-supplied timestamps for these fields are PROHIBITED.
- Soft-delete MUST be used for transactions and categories; hard-delete is PROHIBITED
  unless a user explicitly invokes a "permanently delete" action with a confirmation step.
- All destructive operations (delete, bulk update) MUST require explicit user confirmation
  in the UI (confirm dialog or typed confirmation for bulk actions).
- The backend MUST validate all monetary values server-side: amounts MUST be stored as
  integers (minor currency units, e.g., cents) to avoid floating-point rounding errors.

**Rationale**: Financial records are legally and personally significant; accidental data
loss or corruption has real-world consequences and must be prevented by design.

## Technology Stack & Security Constraints

Permitted and preferred technologies:

| Layer              | Permitted                                                                | Notes                                      |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------ |
| Frontend framework | React, Vue 3, or Svelte                                                  | One framework per project; no mixing       |
| Styling            | CSS Modules, Tailwind CSS, or SCSS                                       | Single shared token/variable file required |
| Markdown parser    | `marked.js` or `markdown-it`                                             | Must include DOMPurify sanitization        |
| HTTP client        | `fetch` (native) or `axios`                                              | Centralized API client module required     |
| Backend runtime    | Node.js (Express/Fastify), Python (FastAPI/Django), or Go                | Team decision; document in plan.md         |
| Database           | PostgreSQL (preferred), MySQL, or SQLite (dev only)                      | SQLite PROHIBITED in production            |
| Auth               | JWT (access + refresh token pair) or session cookies (HttpOnly, Secure)  | No localStorage for tokens                 |
| Hosting            | Any PaaS/IaaS that supports persistent DB (Railway, Render, Fly.io, VPS) | Static-only hosts PROHIBITED               |
| Analytics          | Optional; MUST be async and GDPR-compliant                               | No analytics without user consent          |

**Prohibited**: Storing monetary values as `float`/`double`; using `eval()` or
`innerHTML` with unsanitized user content; committing `.env` files or secrets to the
repository.

## Development Workflow

Standards governing how code is written, reviewed, and released:

- **API-first**: Backend API contracts (request/response schemas) MUST be documented in
  `specs/contracts/` before frontend implementation begins for any feature.
- **Environment parity**: Development, staging, and production MUST use the same database
  engine; SQLite in dev with PostgreSQL in prod is PROHIBITED.
- **Database migrations**: All schema changes MUST be managed via a migration tool
  (e.g., Flyway, Alembic, Prisma Migrate); direct schema edits on a running DB are
  PROHIBITED.
- **Input validation**: All user-supplied data MUST be validated on the server side;
  client-side validation is additive UX only and MUST NOT replace server validation.
- **Responsive gate**: All UI changes MUST be tested at 320 px, 768 px, and 1280 px
  viewport widths before merge.
- **Security gate**: OWASP Top 10 checklist items relevant to the feature MUST be
  reviewed before every pull request is approved.
- **Branch strategy**: Feature branches follow `###-feature-name`; direct commits to
  `main` are PROHIBITED except for hotfixes; hotfixes MUST be reviewed async within
  24 hours.
- **Secrets management**: All credentials and API keys MUST be stored in environment
  variables; `.env` files MUST be listed in `.gitignore` and MUST NEVER be committed.

## Governance

- This constitution supersedes all other development practices and README guidelines.
- Amendments require: (1) a written rationale, (2) a version bump following semantic
  versioning rules, (3) an updated Sync Impact Report prepended to this file, and
  (4) a commit with message format: `docs: amend constitution to vX.Y.Z (<summary>)`.
- MAJOR bump: removal or redefinition of any core principle.
- MINOR bump: addition of a new principle, section, or materially expanded guidance.
- PATCH bump: clarifications, wording fixes, non-semantic refinements.
- All pull requests MUST include a "Constitution Check" confirming compliance with
  Principles I–V before approval.
- A compliance review of all five principles MUST be conducted at the start of each
  new feature plan (`/speckit.plan` gate).

**Version**: 1.0.0 | **Ratified**: 2026-03-30 | **Last Amended**: 2026-03-30
