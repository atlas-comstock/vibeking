import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("API health", () => {
  it("returns ok from /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; service: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("vibeking-api");
  });
});