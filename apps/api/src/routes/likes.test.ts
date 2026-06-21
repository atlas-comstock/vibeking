import { describe, expect, it, vi, beforeEach } from "vitest";

vi.stubEnv("NODE_ENV", "test");

const toggleLike = vi.fn();
const hasLiked = vi.fn();

vi.mock("@vibeking/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vibeking/db")>();
  return {
    ...actual,
    getDb: () => ({}),
    toggleLike,
    hasLiked,
  };
});

const { app } = await import("../app.js");

describe("likes API", () => {
  beforeEach(() => {
    toggleLike.mockReset();
    hasLiked.mockReset();
  });

  it("toggles like for anonymous viewers", async () => {
    toggleLike.mockResolvedValue({ liked: true, likeCount: 3 });

    const res = await app.request("/api/v1/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
        "User-Agent": "vitest",
      },
      body: JSON.stringify({
        targetType: "wish",
        targetId: "00000000-0000-4000-8000-000000000010",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { liked: boolean; likeCount: number };
    expect(body).toEqual({ liked: true, likeCount: 3 });
    expect(toggleLike).toHaveBeenCalledOnce();
  });

  it("checks liked state", async () => {
    hasLiked.mockResolvedValue(true);

    const res = await app.request(
      "/api/v1/likes/check?targetType=wish&targetId=00000000-0000-4000-8000-000000000010",
      {
        headers: {
          "X-Forwarded-For": "203.0.113.10",
          "User-Agent": "vitest",
        },
      },
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ liked: true });
  });
});