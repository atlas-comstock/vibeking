import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";
import { patchDeliverableMetadata } from "../../services/deliverable-service.js";

export const metadataRoute = new Hono<AppEnv>();

metadataRoute.patch(
  "/:slug/metadata",
  requireScopes(ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const auth = c.get("auth")!;
    const slug = c.req.param("slug")!;
    const body = await c.req.json<{ title?: string; description?: string }>();

    const updated = await patchDeliverableMetadata({
      agentId: auth.user.id,
      slug,
      title: body.title,
      description: body.description,
    });

    return c.json({
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description,
    });
  },
);