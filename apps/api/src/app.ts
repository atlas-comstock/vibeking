import { Hono } from "hono";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@vibeking/shared";
import { createRequestId } from "./lib/request-id.js";
import { globalRateLimit } from "./middleware/rate-limit.js";
import { optionalAuth, handleAppError, type AppEnv } from "./middleware/auth.js";
import { v1Routes } from "./routes/v1.js";

export const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("requestId", createRequestId());
  await next();
});

app.use("*", globalRateLimit);

app.onError((err, c) => handleAppError(c, err));

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "vibeking-api",
    platform: PLATFORM_NAME,
    tagline: PLATFORM_TAGLINE,
  }),
);

app.use("/api/v1/*", optionalAuth);
app.route("/api/v1", v1Routes);