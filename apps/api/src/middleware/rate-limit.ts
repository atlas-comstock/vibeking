import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { AppError, errorResponse } from "@vibeking/shared";
import type { AppEnv } from "./auth.js";

export function getClientIp(c: Context): string {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitAction(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export const globalRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const ip = c.req.header("x-forwarded-for") ?? "anon";
  if (!rateLimitAction(`global:${ip}`, 100, 60_000)) {
    return c.json(errorResponse("RATE_LIMITED", "Rate limit exceeded", c.get("requestId")), 429);
  }
  await next();
});

export function rateLimitMiddleware(
  keyPrefix: string,
  limit: number,
  windowSeconds: number,
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const auth = c.get("auth");
    const identity = auth?.user.id ?? c.req.header("x-forwarded-for") ?? "anon";
    if (
      !rateLimitAction(
        `rl:${keyPrefix}:${identity}`,
        limit,
        windowSeconds * 1000,
      )
    ) {
      throw new AppError("RATE_LIMITED", "Rate limit exceeded", 429);
    }
    await next();
  });
}