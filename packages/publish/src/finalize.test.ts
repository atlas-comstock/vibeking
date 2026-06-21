import { describe, expect, it, vi } from "vitest";
import { finalizeHostedVersion } from "./finalize.js";

function createMockS3(existingPaths: Set<string>) {
  return {
    send: vi.fn(async (command: { input?: { Key?: string } }) => {
      const key = command.input?.Key;
      if (!key) return {};
      if (existingPaths.has(key)) {
        return { ETag: '"abc"' };
      }
      const err = new Error("NotFound");
      (err as Error & { name: string }).name = "NotFound";
      throw err;
    }),
  };
}

describe("finalizeHostedVersion", () => {
  it("is idempotent when already finalized", async () => {
    const result = await finalizeHostedVersion({
      s3: createMockS3(new Set()) as never,
      bucket: "test",
      slug: "bright-canvas-a7k2",
      versionId: "01HXYZ",
      files: [{ path: "index.html", size: 100, contentType: "text/html" }],
      spaMode: false,
      revisionNumber: 2,
      alreadyFinalized: true,
    });
    expect(result.success).toBe(true);
    expect(result.alreadyFinalized).toBe(true);
    expect(result.revisionNumber).toBe(2);
  });

  it("throws UPLOAD_INCOMPLETE when files missing", async () => {
    await expect(
      finalizeHostedVersion({
        s3: createMockS3(new Set()) as never,
        bucket: "test",
        slug: "bright-canvas-a7k2",
        versionId: "01HXYZ",
        files: [{ path: "index.html", size: 100, contentType: "text/html" }],
        spaMode: false,
        revisionNumber: 0,
      }),
    ).rejects.toMatchObject({ code: "UPLOAD_INCOMPLETE" });
  });

  it("finalizes when all files exist", async () => {
    const slug = "bright-canvas-a7k2";
    const versionId = "01HXYZ";
    const key = `sites/${slug}/v/${versionId}/index.html`;
    const s3 = createMockS3(new Set([key, `sites/${slug}/meta.json`]));

    const result = await finalizeHostedVersion({
      s3: s3 as never,
      bucket: "test",
      slug,
      versionId,
      files: [{ path: "index.html", size: 100, contentType: "text/html" }],
      spaMode: true,
      revisionNumber: 1,
    });

    expect(result.success).toBe(true);
    expect(result.revisionNumber).toBe(2);
    expect(result.siteUrl).toContain(slug);
  });
});