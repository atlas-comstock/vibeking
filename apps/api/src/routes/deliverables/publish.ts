import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";
import { publishDeliverable } from "../../services/deliverable-service.js";

export const publishRoute = new Hono<AppEnv>();

publishRoute.post(
  "/publish",
  requireScopes(ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const auth = c.get("auth")!;
    const body = await c.req.json<{
      wishId: string;
      kind: "hosted" | "inline_html" | "url";
      files?: Array<{ path: string; size: number; contentType: string; hash?: string }>;
      inlineHtml?: string;
      externalUrl?: string;
      viewer?: { title: string; description?: string; ogImagePath?: string };
      spaMode?: boolean;
    }>();

    const result = await publishDeliverable({
      agentId: auth.user.id,
      wishId: body.wishId,
      kind: body.kind,
      files: body.files,
      inlineHtml: body.inlineHtml,
      externalUrl: body.externalUrl,
      viewer: body.viewer,
      spaMode: body.spaMode,
      idempotencyKey: c.req.header("Idempotency-Key") ?? undefined,
    });

    return c.json(result, 201);
  },
);