import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { CategoryDTO } from "@/types";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;

  const where = {
    userId,
    deletedAt: null,
    ...(type ? { type } : {}),
  };

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const result: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    isSystemDerived: c.isSystemDerived,
    createdAt: c.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const { name, type } = parsed.data;

  // Check duplicate name (case-insensitive, same type)
  const existing = await prisma.category.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
      type,
      deletedAt: null,
    },
  });
  if (existing) {
    return NextResponse.json(
      { code: "CATEGORY_EXISTS", message: "Danh mục này đã tồn tại" },
      { status: 409 },
    );
  }

  const category = await prisma.category.create({
    data: { userId, name, type, isSystemDerived: false },
  });

  const result: CategoryDTO = {
    id: category.id,
    name: category.name,
    type: category.type,
    isSystemDerived: category.isSystemDerived,
    createdAt: category.createdAt.toISOString(),
  };

  return NextResponse.json(result, { status: 201 });
}
