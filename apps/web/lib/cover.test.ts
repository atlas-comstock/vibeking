import { describe, expect, it } from "vitest";
import {
  buildPosterCoverUrl,
  getCoverVisual,
  googleFaviconUrl,
  parseOgImage,
} from "./cover";

describe("cover helpers", () => {
  it("picks stable visuals from seed", () => {
    const a = getCoverVisual("wish-1", "wish");
    const b = getCoverVisual("wish-1", "wish");
    const c = getCoverVisual("wish-2", "wish");
    expect(a).toEqual(b);
    expect(a.emoji).not.toEqual(c.emoji);
  });

  it("parses og:image from html", () => {
    const html = `<meta property="og:image" content="https://cdn.example.com/hero.png" />`;
    expect(parseOgImage(html)).toBe("https://cdn.example.com/hero.png");
  });

  it("builds poster cover url", () => {
    const url = buildPosterCoverUrl({
      type: "wish",
      seed: "abc",
      title: "桌游万境奇旅",
      tags: ["桌游", "游戏"],
    });
    expect(url).toContain("/api/cover/poster?");
    expect(url).toContain("seed=abc");
    expect(url).toContain("title=");
  });

  it("builds google favicon url", () => {
    expect(googleFaviconUrl("https://wanjing-qi-lv.vercel.app")).toContain(
      "wanjing-qi-lv.vercel.app",
    );
  });
});