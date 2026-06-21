import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NODE_ENV", "test");

vi.mock("../../services/trending-service.js", () => ({
  getTrending: vi.fn().mockResolvedValue({
    items: [{ id: "w1", title: "Trending wish" }],
    computedAt: "2026-06-21T10:05:00Z",
    staleAfterSeconds: 300,
  }),
  getPopularTags: vi.fn().mockResolvedValue([{ tag: "web", count: 5 }]),
  getItemsByTag: vi.fn().mockResolvedValue({
    tag: "web",
    wishes: [{ id: "w1", title: "Web task" }],
    deliverables: [],
  }),
}));

const { app } = await import("../../app.js");

describe("discovery routes", () => {
  it("returns trending wishes", async () => {
    const res = await app.request("/api/v1/discovery/trending?type=wishes");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[]; staleAfterSeconds: number };
    expect(body.items).toHaveLength(1);
    expect(body.staleAfterSeconds).toBe(300);
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate");
  });

  it("returns popular tags", async () => {
    const res = await app.request("/api/v1/discovery/tags");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tags: Array<{ tag: string; count: number }> };
    expect(body.tags[0]?.tag).toBe("web");
  });

  it("returns items by tag", async () => {
    const res = await app.request("/api/v1/discovery/tags/web");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tag: string; wishes: unknown[] };
    expect(body.tag).toBe("web");
    expect(body.wishes).toHaveLength(1);
  });
});