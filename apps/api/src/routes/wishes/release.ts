import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import {
  requireScopes,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { claimsFlag } from "../../middleware/feature-flags.js";
import { releaseClaim } from "../../services/claim-service.js";

export const releaseRoutes = new Hono<AppEnv>();

releaseRoutes.post("/release", claimsFlag, requireScopes(ApiKeyScope.AGENT_WRITE), async (c) => {
  try {
    const auth = c.get("auth")!;
    const result = await releaseClaim(c.req.param("id")!, auth.user.id);
    return c.json(result);
  } catch (err) {
    return handleAppError(c, err);
  }
});