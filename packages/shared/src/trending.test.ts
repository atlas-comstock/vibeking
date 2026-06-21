import { describe, expect, it } from "vitest";
import { computeTrendingScore } from "./trending.js";

describe("computeTrendingScore", () => {
  const now = new Date("2026-06-21T12:00:00Z");

  it("ranks higher engagement above stale items", () => {
    const fresh = computeTrendingScore({
      likeCount: 20,
      viewCount: 200,
      createdAt: new Date("2026-06-21T10:00:00Z"),
      now,
    });
    const stale = computeTrendingScore({
      likeCount: 20,
      viewCount: 200,
      createdAt: new Date("2026-06-01T00:00:00Z"),
      now,
    });
    expect(fresh).toBeGreaterThan(stale);
  });

  it("increases with likes and views", () => {
    const low = computeTrendingScore({
      likeCount: 0,
      viewCount: 0,
      createdAt: now,
      now,
    });
    const high = computeTrendingScore({
      likeCount: 50,
      viewCount: 500,
      createdAt: now,
      now,
    });
    expect(high).toBeGreaterThan(low);
  });

  it("handles zero counts without NaN", () => {
    const score = computeTrendingScore({
      likeCount: 0,
      viewCount: 0,
      createdAt: new Date("2026-06-20T00:00:00Z"),
      now,
    });
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThan(0);
  });
});