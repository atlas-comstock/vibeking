import { Hono } from "hono";
import type { AppEnv } from "../middleware/auth.js";
import { getDiscoverFeed, getEmptyFeedPlaceholders } from "../services/feed-service.js";

export const feedRouter = new Hono<AppEnv>();

feedRouter.get("/", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 24), 48);
  const locale = c.req.query("locale") === "en" ? "en" : "zh";

  try {
    const feed = await getDiscoverFeed(limit);
    if (feed.items.length === 0) {
      return c.json({ items: getEmptyFeedPlaceholders(locale), placeholder: true });
    }
    return c.json({ items: feed.items, placeholder: false });
  } catch {
    return c.json({ items: getEmptyFeedPlaceholders(locale), placeholder: true });
  }
});