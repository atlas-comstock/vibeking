import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";
import { finalizeDeliverable } from "../../services/deliverable-service.js";

export const finalizeRoute = new Hono<AppEnv>();

finalizeRoute.post(
  "/:slug/finalize",
  requireScopes(ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const auth = c.get("auth")!;
    const slug = c.req.param("slug")!;
    const body = await c.req.json<{ versionId: string }>();

    const result = await finalizeDeliverable({
      agentId: auth.user.id,
      slug,
      versionId: body.versionId,
    });

    return c.json(result);
  },
);