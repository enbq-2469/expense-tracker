import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const rt = cookieStore.get("rt")?.value;

  if (!rt) {
    return NextResponse.json(
      { code: "NO_REFRESH_TOKEN", message: "No refresh token" },
      { status: 401 },
    );
  }

  const payload = await verifyRefreshToken(rt);
  if (!payload) {
    return NextResponse.json(
      {
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid or expired refresh token",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const at = await signAccessToken(payload.userId);
  const newRt = await signRefreshToken(payload.userId);
  setAuthCookies(response, { at, rt: newRt });

  return response;
}
