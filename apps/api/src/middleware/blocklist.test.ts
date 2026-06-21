import { describe, expect, it, vi } from "vitest";

vi.stubEnv("SLUG_BLOCKLIST", "blocked-slug");
vi.stubEnv("NODE_ENV", "test");

vi.mock("../services/deliverable-service.js", () => ({
  getDeliverableBySlug: vi.fn(),
}));

const { app } = await import("../app.js");

describe("blocklist middleware", () => {
  it("returns 451 for blocklisted slug", async () => {
    const res = await app.request("/api/v1/deliverables/blocked-slug");
    expect(res.status).toBe(451);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("SLUG_BLOCKED");
  });
});