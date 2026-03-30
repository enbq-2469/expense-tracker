import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createTokenPair, setAuthCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "Email hoặc mật khẩu không đúng.",
        },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "Email hoặc mật khẩu không đúng.",
        },
        { status: 401 },
      );
    }

    const tokens = await createTokenPair(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    });

    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("[POST /api/v1/auth/login]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Đã xảy ra lỗi, vui lòng thử lại." },
      { status: 500 },
    );
  }
}
