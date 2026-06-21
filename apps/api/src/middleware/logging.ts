import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./auth.js";

export const requestLogging: MiddlewareHandler<AppEnv> = async (c, next) => {
  const start = Date.now();
  await next();
  const durationMs = Date.now() - start;
  const entry = {
    level: c.res.status >= 500 ? "error" : "info",
    msg: "request",
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs,
    requestId: c.get("requestId"),
  };
  console.log(JSON.stringify(entry));
};