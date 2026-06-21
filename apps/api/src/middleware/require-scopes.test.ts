import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { requireScopes, type AppEnv } from "./auth.js";
import { ApiKeyScope } from "@vibeking/shared";

describe("requireScopes", () => {
  it("returns 401 when unauthenticated", async () => {
    const app = new Hono<AppEnv>();
    app.post("/likes", requireScopes(ApiKeyScope.USER_WRITE), (c) => c.json({ ok: true }));

    const res = await app.request("/likes", { method: "POST" });
    expect(res.status).toBe(401);
  });
});