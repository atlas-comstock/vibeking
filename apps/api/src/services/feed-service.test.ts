import { describe, expect, it } from "vitest";
import { normalizeFeedSiteUrl } from "./feed-service.js";

describe("normalizeFeedSiteUrl", () => {
  it("normalizes trailing slashes and casing", () => {
    expect(normalizeFeedSiteUrl("https://Example.com/path/")).toBe(
      "https://example.com/path",
    );
  });

  it("strips query and hash", () => {
    expect(normalizeFeedSiteUrl("https://wanjing-qi-lv.vercel.app/?x=1#top")).toBe(
      "https://wanjing-qi-lv.vercel.app",
    );
  });
});