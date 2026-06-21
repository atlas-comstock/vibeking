import { describe, expect, it } from "vitest";
import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@vibeking/shared";

describe("web shared constants", () => {
  it("uses platform branding from shared package", () => {
    expect(PLATFORM_NAME).toBe("VibeKing");
    expect(PLATFORM_TAGLINE).toBe("许愿变成可爱作品");
  });
});