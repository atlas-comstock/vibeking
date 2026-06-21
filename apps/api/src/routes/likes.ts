import { Hono } from "hono";
import { AppError, ApiKeyScope, TargetType } from "@vibeking/shared";
import type { TargetType as TargetTypeValue } from "@vibeking/shared";
import { getDb, hasLiked, toggleLike } from "@vibeking/db";
import { optionalAuth, type AppEnv } from "../middleware/auth.js";
import { getClientIp, rateLimitAction } from "../middleware/rate-limit.js";
import { computeLikeViewerKey } from "../services/view-service.js";

export const likesRouter = new Hono<AppEnv>();

const ANON_LIKES_PER_HOUR = 60;

function parseTarget(body: { targetType?: TargetTypeValue; targetId?: string }) {
  if (!body.targetType || !body.targetId) {
    throw new AppError("VALIDATION_ERROR", "targetType and targetId are required", 422);
  }
  if (body.targetType !== TargetType.WISH && body.targetType !== TargetType.DELIVERABLE) {
    throw new AppError("VALIDATION_ERROR", "Invalid targetType", 422);
  }
  return { targetType: body.targetType, targetId: body.targetId };
}

function resolveLikeIdentity(c: Parameters<typeof optionalAuth>[0]) {
  const auth = c.get("auth");
  if (auth) {
    return { userId: auth.user.id };
  }
  return { viewerKey: computeLikeViewerKey(c) };
}

function enforceAnonLikeRateLimit(c: Parameters<typeof getClientIp>[0]) {
  const ip = getClientIp(c);
  if (!rateLimitAction(`likes:anon:hour:${ip}`, ANON_LIKES_PER_HOUR, 3_600_000)) {
    throw new AppError("RATE_LIMITED", "点赞太频繁啦，歇一会儿～", 429);
  }
}

likesRouter.get("/check", optionalAuth, async (c) => {
  const targetType = c.req.query("targetType") as TargetTypeValue | undefined;
  const targetId = c.req.query("targetId");
  if (!targetType || !targetId) {
    throw new AppError("VALIDATION_ERROR", "targetType and targetId are required", 422);
  }
  if (targetType !== TargetType.WISH && targetType !== TargetType.DELIVERABLE) {
    throw new AppError("VALIDATION_ERROR", "Invalid targetType", 422);
  }

  const identity = resolveLikeIdentity(c);
  const liked = await hasLiked(getDb(), identity, targetType, targetId);
  return c.json({ liked });
});

likesRouter.post("/", optionalAuth, async (c) => {
  const auth = c.get("auth");
  const body = await c.req.json<{ targetType: TargetTypeValue; targetId: string }>();

  if (auth?.authMethod === "api_key") {
    const hasScope = auth.scopes.includes(ApiKeyScope.USER_WRITE);
    if (!hasScope) {
      throw new AppError("FORBIDDEN", "Insufficient API key scopes", 403);
    }
  }

  if (!auth) {
    enforceAnonLikeRateLimit(c);
  }

  const { targetType, targetId } = parseTarget(body);
  const identity = resolveLikeIdentity(c);
  const result = await toggleLike(getDb(), {
    ...identity,
    targetType,
    targetId,
  });

  return c.json(result);
});