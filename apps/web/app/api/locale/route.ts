import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function POST(req: Request) {
  const body = (await req.json()) as { locale?: string };
  const locale = body.locale === "en" ? "en" : "zh";
  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}