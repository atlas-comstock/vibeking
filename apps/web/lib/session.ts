import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@vibeking/shared";
import { api, buildCookieHeader } from "./api";
import { CSRF_COOKIE, SESSION_COOKIE } from "./config";

export type SessionContext = {
  sessionId?: string;
  csrfToken?: string;
  cookieHeader?: string;
  user: User | null;
};

export async function getSession(): Promise<SessionContext> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const csrfToken = cookieStore.get(CSRF_COOKIE)?.value;
  const cookieHeader = buildCookieHeader(sessionId, csrfToken);

  if (!sessionId) {
    return { sessionId, csrfToken, cookieHeader, user: null };
  }

  try {
    const user = await api.getMe(cookieHeader);
    return { sessionId, csrfToken, cookieHeader, user };
  } catch {
    return { sessionId: undefined, csrfToken, cookieHeader, user: null };
  }
}

export async function requireUser(
  returnPath?: string,
): Promise<SessionContext & { user: User }> {
  const session = await getSession();
  if (!session.user) {
    const login = new URL("/login", "http://localhost");
    if (returnPath) login.searchParams.set("redirect", returnPath);
    redirect(`${login.pathname}${login.search}`);
  }
  return session as SessionContext & { user: User };
}