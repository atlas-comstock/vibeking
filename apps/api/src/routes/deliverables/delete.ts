import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";
import { deleteDeliverable } from "../../services/deliverable-service.js";

export const deleteRoute = new Hono<AppEnv>();

deleteRoute.delete(
  "/:slug",
  requireScopes(ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const auth = c.get("auth")!;
    const slug = c.req.param("slug")!;
    const result = await deleteDeliverable({ agentId: auth.user.id, slug });
    return c.json(result);
  },
);