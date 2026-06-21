import { describe, expect, it } from "vitest";
import {
  generateSlug,
  generateSlugCandidate,
  isSlugBlocked,
  parseSlugBlocklist,
  RESERVED_SLUGS,
} from "./slug.js";

describe("slug generation", () => {
  it("generates adjective-noun-hash format", () => {
    const slug = generateSlugCandidate();
    expect(slug).toMatch(/^[a-z]+-[a-z]+-[a-f0-9]{4}$/);
  });

  it("retries on collision and falls back to ulid suffix", async () => {
    const taken = new Set<string>();
    const slug = await generateSlug(async (candidate) => {
      if (taken.has(candidate)) return true;
      taken.add(candidate);
      return taken.size <= 5;
    });
    expect(slug).toMatch(/^site-[a-z0-9]{8}$/);
  });

  it("respects reserved and env blocklist", () => {
    const blocklist = parseSlugBlocklist("evil,spam");
    expect(isSlugBlocked("api", blocklist)).toBe(true);
    expect(isSlugBlocked("evil", blocklist)).toBe(true);
    expect(isSlugBlocked("bright-canvas-a7k2", blocklist)).toBe(false);
    expect(RESERVED_SLUGS.has("preview")).toBe(true);
  });
});