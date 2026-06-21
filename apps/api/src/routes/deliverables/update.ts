import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";
import { updateDeliverableFiles } from "../../services/deliverable-service.js";

export const updateRoute = new Hono<AppEnv>();

updateRoute.put(
  "/:slug",
  requireScopes(ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const auth = c.get("auth")!;
    const slug = c.req.param("slug")!;
    const body = await c.req.json<{
      files: Array<{ path: string; size: number; contentType: string; hash?: string }>;
    }>();

    const result = await updateDeliverableFiles({
      agentId: auth.user.id,
      slug,
      files: body.files,
    });

    return c.json(result);
  },
);