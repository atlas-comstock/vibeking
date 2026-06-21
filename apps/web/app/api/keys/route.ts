import { NextResponse } from "next/server";
import type { ApiKeyScope } from "@vibeking/shared";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; scopes?: ApiKeyScope[] };
  const key = await api.createApiKey(
    {
      name: body.name ?? "default",
      scopes: body.scopes ?? ["user:read", "user:write"],
    },
    session.cookieHeader,
    session.csrfToken,
  );

  return NextResponse.json(key, { status: 201 });
}