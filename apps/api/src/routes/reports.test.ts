import { describe, expect, it, vi, beforeEach } from "vitest";

vi.stubEnv("NODE_ENV", "test");

const createReport = vi.fn();

vi.mock("../services/report-service.js", () => ({
  createReport,
}));

const mockUser = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "test@example.com",
  displayName: "Test User",
  role: "wisher",
  createdAt: new Date(),
};

vi.mock("@vibeking/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vibeking/db")>();
  return {
    ...actual,
    getDb: () => ({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [mockUser],
          }),
        }),
      }),
    }),
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

describe("POST /api/v1/reports", () => {
  beforeEach(() => {
    createReport.mockReset();
  });

  it("creates a report for authenticated users", async () => {
    createReport.mockResolvedValue({
      id: "rep-1",
      targetType: "deliverable",
      targetId: "d-1",
      status: "open",
      createdAt: "2026-06-21T10:00:00Z",
    });

    const res = await app.request("/api/v1/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "deliverable",
        targetId: "00000000-0000-4000-8000-000000000020",
        reason: "Inappropriate content",
      }),
    });

    expect(res.status).toBe(201);
    expect(createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        reporterId: "00000000-0000-4000-8000-000000000002",
        targetType: "deliverable",
      }),
    );
  });
});