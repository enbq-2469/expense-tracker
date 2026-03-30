# Data Model: Personal Finance Management Web App

**Feature**: `001-personal-finance-web-app`  
**Date**: 2026-03-30  
**ORM**: Prisma v5 | **Database**: PostgreSQL 16

---

## Entity Relationship Overview

```
User ──< Category        (one user → many categories)
User ──< Transaction     (one user → many transactions)
Category ──< Transaction (one category → many transactions)
system_categories        (global reference table; no FK to users)
```

---

## Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

enum CategoryType {
  INCOME
  EXPENSE
}

// ─────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt     @map("updated_at")

  categories   Category[]
  transactions Transaction[]

  @@map("users")
}

/// Global master category reference — immutable; populated by migration 002.
/// Users never write to this table; they get a copy in their own categories.
model SystemCategory {
  id        String       @id @default(cuid())
  name      String
  namEn     String       @map("name_en")
  type      CategoryType
  sortOrder Int          @default(0) @map("sort_order")
  createdAt DateTime     @default(now()) @map("created_at")

  @@unique([name, type])
  @@map("system_categories")
}

model Category {
  id                String       @id @default(cuid())
  name              String
  type              CategoryType
  isSystemDerived   Boolean      @default(false) @map("is_system_derived")
  deletedAt         DateTime?    @map("deleted_at")
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt     @map("updated_at")

  userId       String        @map("user_id")
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  transactions Transaction[]

  // A user cannot have two active categories with the same name + type.
  // Partial unique index enforced via raw SQL in migration (WHERE deleted_at IS NULL).
  @@index([userId, type])
  @@map("categories")
}

model Transaction {
  id          String       @id @default(cuid())
  date        DateTime     @db.Date           // date only; no time component stored
  note        String       @default("")       // Markdown text
  amountVnd   Int          @map("amount_vnd") // positive integer; type field determines income/expense
  type        CategoryType
  deletedAt   DateTime?    @map("deleted_at")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt     @map("updated_at")

  categoryId  String       @map("category_id")
  category    Category     @relation(fields: [categoryId], references: [id])

  userId      String       @map("user_id")
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([userId, type, date])
  @@map("transactions")
}
```

---

## Migration 001 — `init_schema`

**File**: `prisma/migrations/20260330000001_init_schema/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable: users
CREATE TABLE "users" (
    "id"            TEXT        NOT NULL,
    "email"         TEXT        NOT NULL,
    "password_hash" TEXT        NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: system_categories
CREATE TABLE "system_categories" (
    "id"         TEXT        NOT NULL,
    "name"       TEXT        NOT NULL,
    "name_en"    TEXT        NOT NULL,
    "type"       "CategoryType" NOT NULL,
    "sort_order" INTEGER     NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "system_categories_name_type_key" ON "system_categories"("name", "type");

-- CreateTable: categories
CREATE TABLE "categories" (
    "id"                TEXT           NOT NULL,
    "name"              TEXT           NOT NULL,
    "type"              "CategoryType" NOT NULL,
    "is_system_derived" BOOLEAN        NOT NULL DEFAULT false,
    "deleted_at"        TIMESTAMP(3),
    "created_at"        TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3)   NOT NULL,
    "user_id"           TEXT           NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");
-- Partial unique: prevent duplicate active category names per user+type
CREATE UNIQUE INDEX "categories_user_id_name_type_active_key"
    ON "categories"("user_id", "name", "type")
    WHERE "deleted_at" IS NULL;

-- CreateTable: transactions
CREATE TABLE "transactions" (
    "id"          TEXT           NOT NULL,
    "date"        DATE           NOT NULL,
    "note"        TEXT           NOT NULL DEFAULT '',
    "amount_vnd"  INTEGER        NOT NULL,
    "type"        "CategoryType" NOT NULL,
    "deleted_at"  TIMESTAMP(3),
    "created_at"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3)   NOT NULL,
    "category_id" TEXT           NOT NULL,
    "user_id"     TEXT           NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transactions_category_id_fkey"
        FOREIGN KEY ("category_id") REFERENCES "categories"("id"),
    CONSTRAINT "transactions_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "transactions_amount_positive"
        CHECK ("amount_vnd" > 0)
);
CREATE INDEX "transactions_user_id_date_idx"      ON "transactions"("user_id", "date" DESC);
CREATE INDEX "transactions_user_id_type_date_idx" ON "transactions"("user_id", "type", "date" DESC);
```

---

## Migration 002 — `seed_system_categories`

**File**: `prisma/migrations/20260330000002_seed_system_categories/migration.sql`

```sql
-- ─────────────────────────────────────────────
-- Master Income Categories (5)
-- ─────────────────────────────────────────────
INSERT INTO "system_categories" ("id", "name", "name_en", "type", "sort_order", "created_at") VALUES
    (gen_random_uuid(), 'Lương',          'Salary',            'INCOME', 1, now()),
    (gen_random_uuid(), 'Thưởng',         'Bonus',             'INCOME', 2, now()),
    (gen_random_uuid(), 'Đầu tư',         'Investment Returns','INCOME', 3, now()),
    (gen_random_uuid(), 'Kinh doanh',     'Business Income',   'INCOME', 4, now()),
    (gen_random_uuid(), 'Thu nhập khác',  'Other Income',      'INCOME', 5, now());

-- ─────────────────────────────────────────────
-- Master Expense Categories (10)
-- ─────────────────────────────────────────────
INSERT INTO "system_categories" ("id", "name", "name_en", "type", "sort_order", "created_at") VALUES
    (gen_random_uuid(), 'Ăn uống',          'Food & Drink',      'EXPENSE',  1, now()),
    (gen_random_uuid(), 'Đi lại',           'Transportation',    'EXPENSE',  2, now()),
    (gen_random_uuid(), 'Nhà ở',            'Housing & Rent',    'EXPENSE',  3, now()),
    (gen_random_uuid(), 'Mua sắm',          'Shopping',          'EXPENSE',  4, now()),
    (gen_random_uuid(), 'Giải trí',         'Entertainment',     'EXPENSE',  5, now()),
    (gen_random_uuid(), 'Sức khỏe',         'Health & Medical',  'EXPENSE',  6, now()),
    (gen_random_uuid(), 'Giáo dục',         'Education',         'EXPENSE',  7, now()),
    (gen_random_uuid(), 'Hóa đơn & Tiện ích','Bills & Utilities','EXPENSE',  8, now()),
    (gen_random_uuid(), 'Tiết kiệm',        'Savings',           'EXPENSE',  9, now()),
    (gen_random_uuid(), 'Chi phí khác',     'Other Expenses',    'EXPENSE', 10, now());
```

---

## Registration Seed Query

When `POST /api/v1/auth/register` succeeds, the Route Handler runs the following
inside the same Prisma transaction to copy system categories for the new user:

```sql
INSERT INTO "categories" (
    "id", "name", "type", "is_system_derived",
    "user_id", "created_at", "updated_at"
)
SELECT
    gen_random_uuid(),
    sc."name",
    sc."type",
    true,
    $1,           -- new user id
    now(),
    now()
FROM "system_categories" sc
ORDER BY sc."type", sc."sort_order";
```

Prisma equivalent (using `$queryRaw`):

```typescript
await prisma.$executeRaw`
  INSERT INTO "categories" (id, name, type, is_system_derived, user_id, created_at, updated_at)
  SELECT gen_random_uuid(), name, type, true, ${userId}::text, now(), now()
  FROM system_categories
  ORDER BY type, sort_order
`;
```

---

## Validation Rules

| Field                    | Rule                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `User.email`             | Valid email format; unique; max 255 chars                                 |
| `User.passwordHash`      | Original password: min 8 chars (validated pre-hash)                       |
| `Category.name`          | Non-empty string; max 100 chars; unique per (user, type) when not deleted |
| `Transaction.date`       | Valid date; not in the future by more than 1 day                          |
| `Transaction.amountVnd`  | Integer > 0 (enforced by DB CHECK constraint + Zod)                       |
| `Transaction.note`       | String; max 2000 chars; empty string allowed                              |
| `Transaction.type`       | Must be `INCOME` or `EXPENSE`                                             |
| `Transaction.categoryId` | Must reference a category owned by the same user with `deletedAt IS NULL` |

---

## State Transitions

### Category

```
ACTIVE (deletedAt = null)
  │
  ├─[rename]──▶ ACTIVE (name updated)
  │
  └─[delete + confirm]──▶ SOFT-DELETED (deletedAt = timestamp)
                                │
                                └─ Hidden from all dropdowns and lists
                                   Linked transactions still readable
```

### Transaction

```
ACTIVE (deletedAt = null)
  │
  ├─[edit + save]──▶ ACTIVE (fields updated, updatedAt refreshed)
  │
  └─[delete + confirm]──▶ SOFT-DELETED (deletedAt = timestamp)
                                │
                                └─ Excluded from list queries (WHERE deleted_at IS NULL)
                                   Excluded from chart aggregations
```
