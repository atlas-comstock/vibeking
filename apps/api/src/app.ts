import { Hono } from "hono";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@vibeking/shared";

export const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "vibeking-api",
    platform: PLATFORM_NAME,
    tagline: PLATFORM_TAGLINE,
  }),
);

app.get("/api/v1", (c) =>
  c.json({
    name: PLATFORM_NAME,
    version: "0.0.0",
    message: "VibeKing Wish Platform API",
  }),
);