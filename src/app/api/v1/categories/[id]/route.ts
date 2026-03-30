import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import { CategoryDTO } from "@/types";

interface RouteParams {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });
  if (!category || category.deletedAt) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Category not found" },
      { status: 404 },
    );
  }
  if (category.userId !== userId) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Forbidden" },
      { status: 403 },
    );
  }
  if (category.isSystemDerived) {
    return NextResponse.json(
      {
        code: "SYSTEM_CATEGORY",
        message: "Không thể chỉnh sửa danh mục hệ thống",
      },
      { status: 403 },
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

  const parsed = updateCategorySchema.safeParse(body);
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

  const { name } = parsed.data;

  // Check duplicate name if name is being changed
  if (name && name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: { equals: name, mode: "insensitive" },
        type: category.type,
        deletedAt: null,
        NOT: { id: params.id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { code: "CATEGORY_EXISTS", message: "Danh mục này đã tồn tại" },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { name },
  });

  const result: CategoryDTO = {
    id: updated.id,
    name: updated.name,
    type: updated.type,
    isSystemDerived: updated.isSystemDerived,
    createdAt: updated.createdAt.toISOString(),
  };

  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });
  if (!category || category.deletedAt) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Category not found" },
      { status: 404 },
    );
  }
  if (category.userId !== userId) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Forbidden" },
      { status: 403 },
    );
  }
  if (category.isSystemDerived) {
    return NextResponse.json(
      { code: "SYSTEM_CATEGORY", message: "Không thể xóa danh mục hệ thống" },
      { status: 403 },
    );
  }

  // Check if any transactions reference this category
  const txCount = await prisma.transaction.count({
    where: { categoryId: params.id, deletedAt: null },
  });

  // Soft-delete the category
  await prisma.category.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ id: params.id, txCount });
}
