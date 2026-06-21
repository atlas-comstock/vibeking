import type { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { eq, and, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  ApiKeyScope,
  AppError,
  errorResponse,
} from "@vibeking/shared";
import { getDb } from "@vibeking/db";
import { apiKeys, users, agentProfiles } from "@vibeking/db";
import { getSessionSecret } from "../lib/env.js";

export const SESSION_COOKIE = "vk_session";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  agentProfile: {
    handle: string;
    completedWishesCount: number;
    liveDeliverablesCount: number;
  } | null;
  createdAt: string;
};

export type AuthContext = {
  user: AuthUser;
  scopes: ApiKeyScope[];
  authMethod: "session" | "api_key";
};

type Variables = {
  auth: AuthContext;
  requestId: string;
};

export type AppEnv = {
  Variables: Variables;
};

async function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(await getSecretKey());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, await getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

async function loadUser(userId: string): Promise<AuthUser | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [profile] = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.userId, userId))
    .limit(1);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    agentProfile: profile
      ? {
          handle: profile.handle,
          completedWishesCount: profile.completedWishesCount,
          liveDeliverablesCount: profile.liveDeliverablesCount,
        }
      : null,
    createdAt: user.createdAt.toISOString(),
  };
}

async function authenticateApiKey(rawKey: string): Promise<AuthContext | null> {
  if (!rawKey.startsWith("vk_")) return null;

  const suffix = rawKey.slice(-4);
  const db = getDb();
  const candidates = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keySuffix, suffix), isNull(apiKeys.revokedAt)));

  for (const candidate of candidates) {
    const match = await bcrypt.compare(rawKey, candidate.keyHash);
    if (match) {
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, candidate.id));

      const user = await loadUser(candidate.userId);
      if (!user) return null;

      return {
        user,
        scopes: candidate.scopes as ApiKeyScope[],
        authMethod: "api_key",
      };
    }
  }

  return null;
}

export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer vk_")) {
    const key = authHeader.slice(7);
    const auth = await authenticateApiKey(key);
    if (auth) {
      c.set("auth", auth);
    }
  } else {
    const token = getCookie(c, SESSION_COOKIE);
    if (token) {
      const userId = await verifySessionToken(token);
      if (userId) {
        const user = await loadUser(userId);
        if (user) {
          c.set("auth", {
            user,
            scopes: [],
            authMethod: "session",
          });
        }
      }
    }
  }
  await next();
}

export async function requireAuth(c: Context, next: Next) {
  await optionalAuth(c, async () => {});
  if (!c.get("auth")) {
    return c.json(errorResponse("UNAUTHORIZED", "Authentication required"), 401);
  }
  await next();
}

export async function requireSession(c: Context, next: Next) {
  await optionalAuth(c, async () => {});
  const auth = c.get("auth");
  if (!auth || auth.authMethod !== "session") {
    return c.json(
      errorResponse("FORBIDDEN", "Session authentication required"),
      403,
    );
  }
  await next();
}

export function requireScopes(...required: ApiKeyScope[]) {
  return async (c: Context, next: Next) => {
    await optionalAuth(c, async () => {});
    const auth = c.get("auth");
    if (!auth) {
      return c.json(errorResponse("UNAUTHORIZED", "Authentication required"), 401);
    }

    if (auth.authMethod === "session") {
      await next();
      return;
    }

    const hasAll = required.every((s) => auth.scopes.includes(s));
    if (!hasAll) {
      return c.json(errorResponse("FORBIDDEN", "Insufficient API key scopes"), 403);
    }
    await next();
  };
}

export function handleAppError(c: Context, err: unknown) {
  if (err instanceof AppError) {
    return c.json(
      errorResponse(err.code, err.message, c.get("requestId")),
      err.status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503,
    );
  }
  console.error(err);
  return c.json(
    errorResponse("VALIDATION_ERROR", "Internal server error", c.get("requestId")),
    500,
  );
}