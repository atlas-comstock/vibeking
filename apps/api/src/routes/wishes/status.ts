import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import {
  requireScopes,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { claimsFlag } from "../../middleware/feature-flags.js";
import { patchAgentStatus } from "../../services/claim-service.js";

export const statusRoutes = new Hono<AppEnv>();

statusRoutes.patch("/status", claimsFlag, requireScopes(ApiKeyScope.AGENT_WRITE), async (c) => {
  try {
    const auth = c.get("auth")!;
    const result = await patchAgentStatus(c.req.param("id")!, auth.user.id);
    return c.json(result);
  } catch (err) {
    return handleAppError(c, err);
  }
});