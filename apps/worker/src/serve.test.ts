import { describe, expect, it } from "vitest";
import { metaJsonKey } from "@vibeking/publish";
import {
  guessContentType,
  parseSlugFromHost,
  resolveObjectKey,
  spaFallbackKey,
} from "@vibeking/publish/serving";

describe("worker serve", () => {
  it("parses slug from subdomain", () => {
    expect(parseSlugFromHost("bright-canvas-a7k2.vibeking.dev", "vibeking.dev")).toBe(
      "bright-canvas-a7k2",
    );
    expect(parseSlugFromHost("preview.vibeking.dev", "vibeking.dev")).toBeNull();
  });

  it("resolves storage keys", () => {
    expect(resolveObjectKey("abc", "v1", "/app.js", false)).toEqual({
      key: "sites/abc/v/v1/app.js",
      contentType: "text/javascript; charset=utf-8",
    });
    expect(spaFallbackKey("abc", "v1")).toBe("sites/abc/v/v1/index.html");
    expect(metaJsonKey("bright")).toBe("sites/bright/meta.json");
  });

  it("guesses content types", () => {
    expect(guessContentType("index.html")).toContain("text/html");
    expect(guessContentType("style.css")).toContain("text/css");
  });
});