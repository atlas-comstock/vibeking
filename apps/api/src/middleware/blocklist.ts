import { createMiddleware } from "hono/factory";
import { errorResponse } from "@vibeking/shared";
import { isSlugBlocked } from "@vibeking/publish";
import type { AppEnv } from "./auth.js";
import { config } from "../config.js";

export const blocklistMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const slug = c.req.param("slug");
  if (slug && isSlugBlocked(slug, config.slugBlocklist)) {
    return c.json(
      errorResponse("SLUG_BLOCKED", "This deliverable is unavailable", c.get("requestId")),
      451,
    );
  }
  await next();
});