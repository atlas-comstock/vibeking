import { Hono } from "hono";
import {
  requireSession,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { acceptWish } from "../../services/claim-service.js";

export const acceptRoutes = new Hono<AppEnv>();

acceptRoutes.post("/accept", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    const result = await acceptWish(c.req.param("id")!, auth.user.id);
    return c.json(result);
  } catch (err) {
    return handleAppError(c, err);
  }
});