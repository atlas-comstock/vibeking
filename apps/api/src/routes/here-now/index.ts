import { Hono } from "hono";
import { HereNowClient } from "@vibeking/here-now";
import { ApiKeyScope } from "@vibeking/shared";
import { sitePosts, getDb } from "@vibeking/db";
import { requireScopes, type AppEnv } from "../../middleware/auth.js";

export const hereNowRouter = new Hono<AppEnv>();

hereNowRouter.post("/publish", requireScopes(ApiKeyScope.AGENT_WRITE), async (c) => {
  const body = await c.req.json<{
    files: Array<{ path: string; size: number; contentType: string; hash?: string }>;
    viewer?: { title?: string; description?: string };
    spaMode?: boolean;
    tags?: string[];
  }>();

  const client = new HereNowClient();
  const result = await client.publish({
    files: body.files,
    viewer: body.viewer,
    spaMode: body.spaMode,
  });

  const auth = c.get("auth")!;
  const title = body.viewer?.title ?? result.slug;

  try {
    const db = getDb();
    await db.insert(sitePosts).values({
      authorId: auth.user.id,
      slug: result.slug,
      siteUrl: result.siteUrl,
      title,
      description: body.viewer?.description,
      tags: body.tags ?? [],
      source: "here_now",
      coverEmoji: "🌸",
    });
  } catch {
    /* optional when DB unavailable */
  }

  return c.json(result);
});

hereNowRouter.post(
  "/site-posts",
  requireScopes(ApiKeyScope.USER_WRITE, ApiKeyScope.AGENT_WRITE),
  async (c) => {
    const body = await c.req.json<{
      siteUrl: string;
      title: string;
      description?: string;
      tags?: string[];
      slug?: string;
      source?: "here_now" | "hosted" | "url";
      coverEmoji?: string;
    }>();

    const auth = c.get("auth")!;
    const db = getDb();
    const [row] = await db
      .insert(sitePosts)
      .values({
        authorId: auth.user.id,
        siteUrl: body.siteUrl,
        title: body.title,
        description: body.description,
        slug: body.slug,
        tags: body.tags ?? [],
        source: body.source ?? "here_now",
        coverEmoji: body.coverEmoji ?? "✨",
      })
      .returning();

    return c.json({ item: row }, 201);
  },
);