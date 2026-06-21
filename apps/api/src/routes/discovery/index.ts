import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth.js";
import {
  getItemsByTag,
  getPopularTags,
  getTopLikedDeliverables,
  getTopLikedWishes,
  getTrending,
} from "../../services/trending-service.js";

export const discoveryRouter = new Hono<AppEnv>();

discoveryRouter.get("/top", async (c) => {
  const type = c.req.query("type") === "deliverables" ? "deliverables" : "wishes";
  const limit = Math.min(Number(c.req.query("limit") ?? 10), 20);
  const payload =
    type === "deliverables"
      ? await getTopLikedDeliverables(limit)
      : await getTopLikedWishes(limit);
  c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=240");
  return c.json(payload);
});

discoveryRouter.get("/trending", async (c) => {
  const type = c.req.query("type") === "deliverables" ? "deliverables" : "wishes";
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);
  const payload = await getTrending(type, limit);
  c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=240");
  return c.json(payload);
});

discoveryRouter.get("/tags", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
  const tags = await getPopularTags(limit);
  return c.json({ tags });
});

discoveryRouter.get("/tags/:tag", async (c) => {
  const tag = c.req.param("tag");
  const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
  const payload = await getItemsByTag(tag, limit);
  return c.json(payload);
});