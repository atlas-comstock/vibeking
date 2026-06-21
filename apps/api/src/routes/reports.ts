import { Hono } from "hono";
import { AppError, ApiKeyScope } from "@vibeking/shared";
import type { TargetType } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import { createReport } from "../services/report-service.js";

export const reportsRouter = new Hono<AppEnv>();

reportsRouter.post(
  "/",
  requireScopes(ApiKeyScope.USER_WRITE),
  rateLimitMiddleware("reports", 10, 86400),
  async (c) => {
    const auth = c.get("auth")!;
    const body = await c.req.json<{
      targetType: TargetType;
      targetId: string;
      reason: string;
    }>();

    if (!body.targetType || !body.targetId || !body.reason?.trim()) {
      throw new AppError(
        "VALIDATION_ERROR",
        "targetType, targetId, and reason are required",
        422,
      );
    }

    const report = await createReport({
      reporterId: auth.user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason.trim(),
    });

    return c.json(report, 201);
  },
);