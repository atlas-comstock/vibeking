import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CSRF_COOKIE, SESSION_COOKIE } from "@/lib/config";

/**
 * OAuth / magic-link callback stub.
 * In production this route exchanges provider codes via the API;
 * dev flow accepts `session` query param from API redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const sessionId = searchParams.get("session");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/login?error=missing_session", request.url));
  }

  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}