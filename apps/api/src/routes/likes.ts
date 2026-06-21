import { Hono } from "hono";
import { AppError, ApiKeyScope, TargetType } from "@vibeking/shared";
import type { TargetType as TargetTypeValue } from "@vibeking/shared";
import { getDb, toggleLike } from "@vibeking/db";
import { requireScopes, type AppEnv } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";

export const likesRouter = new Hono<AppEnv>();

likesRouter.post(
  "/",
  requireScopes(ApiKeyScope.USER_WRITE),
  rateLimitMiddleware("likes", 60, 3600),
  async (c) => {
    const auth = c.get("auth")!;
    const body = await c.req.json<{ targetType: TargetTypeValue; targetId: string }>();

    if (!body.targetType || !body.targetId) {
      throw new AppError("VALIDATION_ERROR", "targetType and targetId are required", 422);
    }
    if (body.targetType !== TargetType.WISH && body.targetType !== TargetType.DELIVERABLE) {
      throw new AppError("VALIDATION_ERROR", "Invalid targetType", 422);
    }

    const result = await toggleLike(getDb(), {
      userId: auth.user.id,
      targetType: body.targetType,
      targetId: body.targetId,
    });

    return c.json(result);
  },
);