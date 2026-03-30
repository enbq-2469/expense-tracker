import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, verifyAccessToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("at")?.value;
  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Chưa đăng nhập." },
      { status: 401 },
    );
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    // Token invalid but still clear cookies
    const response = NextResponse.json({ message: "Đã đăng xuất." });
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ message: "Đã đăng xuất thành công." });
  clearAuthCookies(response);
  return response;
}
