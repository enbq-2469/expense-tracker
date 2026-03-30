-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable: users
CREATE TABLE "users" (
    "id"            TEXT         NOT NULL,
    "email"         TEXT         NOT NULL,
    "password_hash" TEXT         NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: system_categories
CREATE TABLE "system_categories" (
    "id"         TEXT            NOT NULL,
    "name"       TEXT            NOT NULL,
    "name_en"    TEXT            NOT NULL,
    "type"       "CategoryType"  NOT NULL,
    "sort_order" INTEGER         NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
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
        FOREIGN KEY ("category_id")
        REFERENCES "categories"("id"),
    CONSTRAINT "transactions_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE,
    CONSTRAINT "transactions_amount_positive"
        CHECK ("amount_vnd" > 0)
);

CREATE INDEX "transactions_user_id_date_idx"
    ON "transactions"("user_id", "date" DESC);

CREATE INDEX "transactions_user_id_type_date_idx"
    ON "transactions"("user_id", "type", "date" DESC);
