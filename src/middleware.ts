import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const PROTECTED_ROUTES = ["/home", "/import", "/settings"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("at")?.value;

  const isAuthenticated = accessToken
    ? (await verifyAccessToken(accessToken)) !== null
    : false;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !isAuthenticated &&
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/import",
    "/import/:path*",
    "/settings",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
