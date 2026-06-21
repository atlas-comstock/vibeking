import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const wish = await api.rejectWish(
    id,
    body.reason as string | undefined,
    session.cookieHeader,
    session.csrfToken,
  );
  return NextResponse.json(wish);
}