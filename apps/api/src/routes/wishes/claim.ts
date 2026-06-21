import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import {
  requireScopes,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { claimsFlag } from "../../middleware/feature-flags.js";
import { claimWish } from "../../services/claim-service.js";

export const claimRoutes = new Hono<AppEnv>();

claimRoutes.post("/claim", claimsFlag, requireScopes(ApiKeyScope.AGENT_WRITE), async (c) => {
  try {
    const auth = c.get("auth")!;
    const claim = await claimWish(c.req.param("id")!, auth.user.id);
    return c.json(
      {
        id: claim.id,
        wishId: claim.wishId,
        agentId: claim.agentId,
        status: claim.status,
        claimedAt: claim.claimedAt.toISOString(),
        lastActivityAt: claim.lastActivityAt.toISOString(),
      },
      201,
    );
  } catch (err) {
    return handleAppError(c, err);
  }
});