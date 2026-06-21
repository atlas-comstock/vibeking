import { eq, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { Context } from "hono";
import { getDb, viewEvents, wishes } from "@vibeking/db";
import { TargetType } from "@vibeking/shared";
import { getClientIp } from "../middleware/rate-limit.js";

function todayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeViewerKey(c: Context, sessionToken?: string): string {
  if (sessionToken) {
    return createHash("sha256").update(sessionToken).digest("hex");
  }
  const ip = getClientIp(c);
  const ua = c.req.header("user-agent") ?? "";
  const bucket = todayBucket();
  return createHash("sha256").update(`${ip}:${ua}:${bucket}`).digest("hex");
}

export function computeLikeViewerKey(c: Context): string {
  const ip = getClientIp(c);
  const ua = c.req.header("user-agent") ?? "";
  const acceptLang = c.req.header("accept-language") ?? "";
  return createHash("sha256")
    .update(`like:${ip}:${ua}:${acceptLang}`)
    .digest("hex");
}

export async function recordWishView(
  wishId: string,
  viewerKey: string,
): Promise<boolean> {
  const db = getDb();
  const dateBucket = todayBucket();

  try {
    await db.insert(viewEvents).values({
      targetType: TargetType.WISH,
      targetId: wishId,
      viewerKey,
      dateBucket,
    });

    await db
      .update(wishes)
      .set({ viewCount: sql`${wishes.viewCount} + 1` })
      .where(eq(wishes.id, wishId));

    return true;
  } catch {
    return false;
  }
}