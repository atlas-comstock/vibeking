import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_BASE_URL, PROTECTED_PATHS, SESSION_COOKIE } from "./lib/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: { Cookie: `${SESSION_COOKIE}=${sessionId}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wishes/new", "/dashboard", "/dashboard/:path*"],
};