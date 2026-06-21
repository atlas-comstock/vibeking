import { Hono } from "hono";
import { clearSessionCookie } from "../../middleware/auth.js";

export const logoutRoute = new Hono();

logoutRoute.post("/logout", (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});