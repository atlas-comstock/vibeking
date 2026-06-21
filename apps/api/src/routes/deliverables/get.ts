import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth.js";
import { getDeliverableBySlug } from "../../services/deliverable-service.js";

export const getRoute = new Hono<AppEnv>();

getRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const result = await getDeliverableBySlug(slug);
  c.header("Cache-Control", "public, max-age=60");
  return c.json(result);
});