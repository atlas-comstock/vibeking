import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { api, buildCookieHeader } from "@/lib/api";
import { getSession } from "@/lib/session";

function resolveClientIp(headerStore: Headers) {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (
    !targetId ||
    (targetType !== "wish" && targetType !== "deliverable")
  ) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid like target" } },
      { status: 400 },
    );
  }

  const headerStore = await headers();
  const session = await getSession();
  const cookieHeader = session.user
    ? buildCookieHeader(session.sessionId, session.csrfToken)
    : undefined;

  const result = await api.checkLike(targetType, targetId, {
    cookieHeader,
    clientIp: resolveClientIp(headerStore),
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    targetType?: "wish" | "deliverable";
    targetId?: string;
  };

  if (
    !body.targetId ||
    (body.targetType !== "wish" && body.targetType !== "deliverable")
  ) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid like target" } },
      { status: 400 },
    );
  }

  const headerStore = await headers();
  const session = await getSession();
  const cookieHeader = session.user
    ? buildCookieHeader(session.sessionId, session.csrfToken)
    : undefined;

  const result = await api.toggleLike(
    { targetType: body.targetType, targetId: body.targetId },
    {
      cookieHeader,
      csrfToken: session.csrfToken,
      clientIp: resolveClientIp(headerStore),
    },
  );

  return NextResponse.json(result);
}