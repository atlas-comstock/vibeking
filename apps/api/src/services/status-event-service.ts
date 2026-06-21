import type { WishStatus } from "@vibeking/shared";
import { getDb, statusEvents } from "@vibeking/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export async function logStatusEvent(
  params: {
    wishId: string;
    fromStatus: WishStatus;
    toStatus: WishStatus;
    actorId?: string;
    metadata?: Record<string, unknown>;
  },
  tx?: Db,
) {
  const db = tx ?? getDb();
  await db.insert(statusEvents).values({
    wishId: params.wishId,
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    actorId: params.actorId ?? null,
    metadata: params.metadata ?? {},
  });
}