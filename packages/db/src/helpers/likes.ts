import { and, eq, sql } from "drizzle-orm";
import type { TargetType } from "@vibeking/shared";
import type { Database } from "../client.js";
import { deliverables, likes, wishes } from "../schema/tables.js";

export type LikeToggleResult = {
  liked: boolean;
  likeCount: number;
};

export type LikeIdentity = {
  userId?: string;
  viewerKey?: string;
};

function assertIdentity(identity: LikeIdentity) {
  if (!identity.userId && !identity.viewerKey) {
    throw new Error("Like identity requires userId or viewerKey");
  }
}

function identityCondition(identity: LikeIdentity, targetType: TargetType, targetId: string) {
  if (identity.userId) {
    return and(
      eq(likes.userId, identity.userId),
      eq(likes.targetType, targetType),
      eq(likes.targetId, targetId),
    );
  }
  return and(
    eq(likes.viewerKey, identity.viewerKey!),
    eq(likes.targetType, targetType),
    eq(likes.targetId, targetId),
  );
}

export async function hasLiked(
  db: Database,
  identity: LikeIdentity,
  targetType: TargetType,
  targetId: string,
): Promise<boolean> {
  assertIdentity(identity);
  const [existing] = await db
    .select({ id: likes.id })
    .from(likes)
    .where(identityCondition(identity, targetType, targetId))
    .limit(1);
  return Boolean(existing);
}

export async function toggleLike(
  db: Database,
  input: LikeIdentity & {
    targetType: TargetType;
    targetId: string;
  },
): Promise<LikeToggleResult> {
  assertIdentity(input);

  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: likes.id })
      .from(likes)
      .where(identityCondition(input, input.targetType, input.targetId))
      .limit(1);

    const table = input.targetType === "wish" ? wishes : deliverables;

    if (existing.length > 0) {
      await tx.delete(likes).where(eq(likes.id, existing[0]!.id));
      const [updated] = await tx
        .update(table)
        .set({ likeCount: sql`GREATEST(${table.likeCount} - 1, 0)` })
        .where(eq(table.id, input.targetId))
        .returning({ likeCount: table.likeCount });
      return { liked: false, likeCount: updated?.likeCount ?? 0 };
    }

    await tx.insert(likes).values({
      userId: input.userId ?? null,
      viewerKey: input.viewerKey ?? null,
      targetType: input.targetType,
      targetId: input.targetId,
    });

    const [updated] = await tx
      .update(table)
      .set({ likeCount: sql`${table.likeCount} + 1` })
      .where(eq(table.id, input.targetId))
      .returning({ likeCount: table.likeCount });

    return { liked: true, likeCount: updated?.likeCount ?? 1 };
  });
}