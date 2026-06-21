import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const { id } = await context.params;
  await api.revokeApiKey(id, session.cookieHeader, session.csrfToken);
  return NextResponse.json({ ok: true });
}