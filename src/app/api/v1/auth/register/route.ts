import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createTokenPair, setAuthCookies } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { code: "EMAIL_TAKEN", message: "Email này đã được sử dụng." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and copy system categories in one transaction
    const user = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const newUser = await tx.user.create({
          data: { email, passwordHash },
        });

        // Copy system categories to user's categories
        await tx.$executeRaw`
        INSERT INTO "categories" (id, name, type, is_system_derived, user_id, created_at, updated_at)
        SELECT
          gen_random_uuid()::text,
          name,
          type,
          true,
          ${newUser.id},
          now(),
          now()
        FROM system_categories
        ORDER BY type, sort_order
      `;

        return newUser;
      },
    );

    const tokens = await createTokenPair(user.id);
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );

    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("[POST /api/v1/auth/register]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại." },
      { status: 500 },
    );
  }
}
