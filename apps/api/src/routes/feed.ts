import { Hono } from "hono";
import type { AppEnv } from "../middleware/auth.js";
import { getDiscoverFeed } from "../services/feed-service.js";

export const feedRouter = new Hono<AppEnv>();

feedRouter.get("/", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 24), 48);

  const feed = await getDiscoverFeed(limit);
  return c.json({ items: feed.items });
});