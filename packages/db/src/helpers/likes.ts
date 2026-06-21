import { and, eq, sql } from "drizzle-orm";
import type { TargetType } from "@vibeking/shared";
import type { Database } from "../client.js";
import { deliverables, likes, wishes } from "../schema/tables.js";

export type LikeToggleResult = {
  liked: boolean;
  likeCount: number;
};

export async function toggleLike(
  db: Database,
  input: {
    userId: string;
    targetType: TargetType;
    targetId: string;
  },
): Promise<LikeToggleResult> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.userId, input.userId),
          eq(likes.targetType, input.targetType),
          eq(likes.targetId, input.targetId),
        ),
      )
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
      userId: input.userId,
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