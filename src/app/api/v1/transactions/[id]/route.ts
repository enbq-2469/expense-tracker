import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/validations/transaction.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Chưa đăng nhập." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Giao dịch không tồn tại." },
      { status: 404 },
    );
  }
  if (existing.userId !== userId) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Không có quyền truy cập." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { date, note, amountVnd, type, categoryId } = parsed.data;

  // If categoryId is being changed, verify ownership and type match
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, deletedAt: null },
    });
    if (!category) {
      return NextResponse.json(
        { code: "CATEGORY_NOT_FOUND", message: "Danh mục không tồn tại." },
        { status: 404 },
      );
    }
    const effectiveType = type ?? existing.type;
    if (category.type !== effectiveType) {
      return NextResponse.json(
        {
          code: "TYPE_MISMATCH",
          message: "Loại giao dịch không khớp với danh mục.",
        },
        { status: 422 },
      );
    }
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(date && { date: new Date(date) }),
      ...(note !== undefined && { note }),
      ...(amountVnd !== undefined && { amountVnd }),
      ...(type && { type }),
      ...(categoryId && { categoryId }),
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    date: updated.date.toISOString().split("T")[0],
    note: updated.note,
    amountVnd: updated.amountVnd,
    type: updated.type,
    category: updated.category,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Chưa đăng nhập." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const existing = await prisma.transaction.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Giao dịch không tồn tại." },
      { status: 404 },
    );
  }
  if (existing.userId !== userId) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Không có quyền truy cập." },
      { status: 403 },
    );
  }

  await prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ message: "Đã xóa giao dịch thành công.", id });
}
