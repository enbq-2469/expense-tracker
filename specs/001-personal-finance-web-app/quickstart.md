# Quickstart: Personal Finance Management Web App

**Feature**: `001-personal-finance-web-app`  
**Date**: 2026-03-30  
**Stack**: Next.js 14 · Tailwind CSS · PostgreSQL 16 · Prisma 5

---

## Prerequisites

| Tool                    | Version    | Install                             |
| ----------------------- | ---------- | ----------------------------------- |
| Node.js                 | 20 LTS     | https://nodejs.org                  |
| pnpm                    | 9+         | `npm install -g pnpm`               |
| Docker & Docker Compose | 24+        | https://docs.docker.com/get-docker/ |
| Git                     | any recent | —                                   |

---

## 1. Clone & Install

```bash
git clone https://github.com/enbq-2469/expense-tracker.git
cd expense-tracker
pnpm install
```

---

## 2. Environment Variables

Copy the example file and fill in values:

```bash
cp .env.example .env
```

`.env` content (do NOT commit this file):

```dotenv
# PostgreSQL connection (matches docker-compose.yml defaults)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracker"

# JWT secrets — change to random 64-char strings in production
JWT_ACCESS_SECRET="dev-access-secret-change-in-prod"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-prod"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate secure secrets (run once, paste into `.env`):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

`docker-compose.yml` (at repository root):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: expense_tracker
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

Verify the DB is running:

```bash
docker compose ps
```

---

## 4. Run Database Migrations

Apply all pending migrations (creates tables + seeds master categories):

```bash
pnpm prisma migrate deploy
```

For development (interactive, creates migration files on schema changes):

```bash
pnpm prisma migrate dev
```

Verify migration `002` inserted the 15 master categories:

```bash
pnpm prisma studio   # opens browser UI at http://localhost:5555
# navigate to SystemCategory table → should have 5 INCOME + 10 EXPENSE rows
```

---

## 5. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).  
You will be redirected to `/login` (no session active).

---

## 6. Verify the Full Flow

1. Go to `/signup` → create an account → redirected to `/home`
2. Go to `/settings` → confirm 5 Income and 10 Expense categories are pre-populated
3. Go to `/import` → click **Add** → create one Income and one Expense transaction
4. Go to `/home` → confirm both pie charts render data for the **1 Month** period
5. Go to `/import` → edit and delete a transaction → confirm list updates immediately

---

## 7. Useful Commands

| Command                                 | Description                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                              | Start Next.js dev server with hot reload              |
| `pnpm build`                            | Production build                                      |
| `pnpm start`                            | Start production build                                |
| `pnpm prisma studio`                    | Open Prisma visual DB browser                         |
| `pnpm prisma migrate dev --name <name>` | Create a new migration from schema changes            |
| `pnpm prisma migrate reset`             | Drop all tables and re-run all migrations (dev only!) |
| `pnpm test`                             | Run Vitest unit tests                                 |
| `pnpm test:e2e`                         | Run Playwright end-to-end tests                       |
| `docker compose down -v`                | Stop and remove PostgreSQL container + data volume    |

---

## 8. Project Structure Quick Reference

```
src/
├── app/
│   ├── (auth)/login/       → /login
│   ├── (auth)/signup/      → /signup
│   ├── (dashboard)/home/   → /home   [auth required]
│   ├── (dashboard)/import/ → /import [auth required]
│   ├── (dashboard)/settings/ → /settings [auth required]
│   └── api/v1/             → REST API route handlers
├── components/             → Reusable UI components
├── lib/
│   ├── db.ts               → Prisma client singleton
│   ├── auth.ts             → JWT sign/verify helpers
│   ├── markdown.ts         → markdown-it + DOMPurify (single instance)
│   ├── api-client.ts       → fetch wrapper
│   └── currency.ts         → VND formatter
└── middleware.ts            → JWT auth guard for /home, /import, /settings
```

---

## 9. Common Issues

**`Error: connect ECONNREFUSED 127.0.0.1:5432`**  
→ PostgreSQL is not running. Run `docker compose up -d` and retry.

**`PrismaClientKnownRequestError: relation "users" does not exist`**  
→ Migrations have not been applied. Run `pnpm prisma migrate deploy`.

**`JWT malformed` on every request after changing secrets**  
→ All existing tokens are invalidated. Clear browser cookies and log in again.

**Tailwind styles not applied**  
→ Ensure `tailwind.config.ts` `content` array includes `./src/**/*.{ts,tsx}`.
