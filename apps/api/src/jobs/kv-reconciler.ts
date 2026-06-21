import { eq } from "drizzle-orm";
import { metaJsonKey, syncSlugToKv } from "@vibeking/publish";
import { getDb } from "@vibeking/db";
import { deliverables } from "@vibeking/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";
import { getS3Client } from "../lib/s3.js";

export async function runKvReconciler(): Promise<{ repaired: number; checked: number }> {
  const db = getDb();
  const live = await db
    .select({
      slug: deliverables.slug,
      currentVersionId: deliverables.currentVersionId,
      spaMode: deliverables.spaMode,
    })
    .from(deliverables)
    .where(eq(deliverables.status, "live"));

  let repaired = 0;
  const s3 = getS3Client();

  for (const row of live) {
    if (!row.currentVersionId) continue;

    let metaUpdatedAt: string | undefined;
    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: config.s3.bucket, Key: metaJsonKey(row.slug) }),
      );
      const text = await res.Body?.transformToString();
      if (text) {
        const parsed = JSON.parse(text) as { updatedAt?: string };
        metaUpdatedAt = parsed.updatedAt;
      }
    } catch {
      /* missing meta */
    }

    if (!metaUpdatedAt) {
      await syncSlugToKv(row.slug, {
        currentVersionId: row.currentVersionId,
        spaMode: row.spaMode ?? false,
        updatedAt: new Date().toISOString(),
      });
      repaired += 1;
    }
  }

  return { repaired, checked: live.length };
}

export function scheduleKvReconciler(cron: { schedule: (expr: string, fn: () => void) => void }): void {
  if (config.testMode) return;
  cron.schedule("*/15 * * * *", () => {
    runKvReconciler()
      .then((r) =>
        console.log(JSON.stringify({ level: "info", msg: "kv-reconciler", ...r })),
      )
      .catch((err) =>
        console.error(JSON.stringify({ level: "error", msg: "kv-reconciler", error: String(err) })),
      );
  });
}