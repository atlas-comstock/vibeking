import type { Context, Next } from "hono";

export async function corsData(c: Context, next: Next) {
  const slug = c.req.param("slug");
  const origin = slug ? `https://${slug}.vibeking.dev` : null;

  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, X-VibeKing-Data-Token",
    );
    c.header("Vary", "Origin");
  }

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
}