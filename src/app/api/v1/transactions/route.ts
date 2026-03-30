import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validations/transaction.schema";

type TxWithCategory = {
  id: string;
  date: Date;
  note: string;
  amountVnd: number;
  type: "INCOME" | "EXPENSE";
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string };
};

function serializeTransaction(t: TxWithCategory) {
  return {
    id: t.id,
    date: t.date.toISOString().split("T")[0],
    note: t.note,
    amountVnd: t.amountVnd,
    type: t.type,
    category: { id: t.category.id, name: t.category.name },
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Chưa đăng nhập." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)),
  );
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const categoryId = searchParams.get("categoryId");

  const where = {
    userId,
    deletedAt: null,
    ...(type && { type }),
    ...(categoryId && { categoryId }),
  };

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data: data.map((t: TxWithCategory) => serializeTransaction(t)),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Chưa đăng nhập." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { date, note, amountVnd, type, categoryId } = parsed.data;

  // Verify category belongs to user and is active
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, deletedAt: null },
  });
  if (!category) {
    return NextResponse.json(
      { code: "CATEGORY_NOT_FOUND", message: "Danh mục không tồn tại." },
      { status: 404 },
    );
  }
  if (category.type !== type) {
    return NextResponse.json(
      {
        code: "TYPE_MISMATCH",
        message: "Loại giao dịch không khớp với danh mục.",
      },
      { status: 422 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      note: note ?? "",
      amountVnd,
      type,
      categoryId,
      userId,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json(
    {
      id: transaction.id,
      date: transaction.date.toISOString().split("T")[0],
      note: transaction.note,
      amountVnd: transaction.amountVnd,
      type: transaction.type,
      category: transaction.category,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}
