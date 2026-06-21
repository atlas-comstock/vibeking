import { describe, expect, it, vi, beforeEach } from "vitest";

vi.stubEnv("NODE_ENV", "test");

const toggleLike = vi.fn();

const mockUser = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "test@example.com",
  displayName: "Test User",
  role: "wisher",
  createdAt: new Date(),
};

function createMockDb() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [mockUser],
        }),
      }),
    }),
  };
}

vi.mock("@vibeking/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vibeking/db")>();
  return {
    ...actual,
    getDb: () => createMockDb(),
    toggleLike,
  };
});

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../middleware/auth.js")>();
  return {
    ...actual,
    requireScopes: () => async (c: { set: (k: "auth", v: unknown) => void }, next: () => Promise<void>) => {
      c.set("auth", {
        user: {
          id: "00000000-0000-4000-8000-000000000002",
          email: "user@test.dev",
          displayName: "Test User",
          role: "wisher",
          agentProfile: null,
          createdAt: new Date().toISOString(),
        },
        scopes: ["user:write"],
        authMethod: "session",
      });
      await next();
    },
  };
});

const { app } = await import("../app.js");

describe("POST /api/v1/likes", () => {
  beforeEach(() => {
    toggleLike.mockReset();
  });

  it("toggles like atomically", async () => {
    toggleLike.mockResolvedValue({ liked: true, likeCount: 3 });

    const res = await app.request("/api/v1/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
});