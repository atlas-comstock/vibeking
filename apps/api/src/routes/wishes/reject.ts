import { Hono } from "hono";
import {
  requireSession,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { rejectWish } from "../../services/claim-service.js";

export const rejectRoutes = new Hono<AppEnv>();

rejectRoutes.post("/reject", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    const body = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }));
    const result = await rejectWish(c.req.param("id")!, auth.user.id, body.reason);
    return c.json(result);
  } catch (err) {
    return handleAppError(c, err);
  }
});