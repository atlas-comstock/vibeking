import { describe, expect, it } from "vitest";
import { guessContentType, parseSlugFromHost, resolveObjectKey } from "./serving.js";

describe("serving helpers", () => {
  it("parses host slugs", () => {
    expect(parseSlugFromHost("foo.vibeking.dev", "vibeking.dev")).toBe("foo");
  });

  it("resolves keys and types", () => {
    const { key, contentType } = resolveObjectKey("s", "v", "/a.css", false);
    expect(key).toBe("sites/s/v/v/a.css");
    expect(contentType).toContain("text/css");
    expect(guessContentType("x.pdf")).toContain("pdf");
  });
});