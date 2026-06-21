import { and, asc, eq, isNull } from "drizzle-orm";
import { AppError } from "@vibeking/shared";
import { getDb, users, wishReplies, wishes } from "@vibeking/db";

export type CreateReplyInput = {
  body: string;
  nickname?: string | null;
};

function normalizeNickname(nickname?: string | null): string | null {
  const trimmed = nickname?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 50);
}

export async function listWishReplies(wishId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: wishReplies.id,
      body: wishReplies.body,
      nickname: wishReplies.nickname,
      createdAt: wishReplies.createdAt,
      authorDisplayName: users.displayName,
    })
    .from(wishReplies)
    .innerJoin(users, eq(wishReplies.authorId, users.id))
    .where(and(eq(wishReplies.wishId, wishId), isNull(wishReplies.deletedAt)))
    .orderBy(asc(wishReplies.createdAt));

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    displayName: row.nickname ?? row.authorDisplayName,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createWishReply(
  wishId: string,
  authorId: string,
  input: CreateReplyInput,
) {
  const body = input.body?.trim();
  if (!body) {
    throw new AppError("VALIDATION_ERROR", "回复内容不能为空", 400);
  }
  if (body.length > 2000) {
    throw new AppError("VALIDATION_ERROR", "回复太长了，精简一下～", 400);
  }

  const db = getDb();
  const [wish] = await db
    .select({ id: wishes.id })
    .from(wishes)
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .limit(1);

  if (!wish) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  const nickname = normalizeNickname(input.nickname);
  const [created] = await db
    .insert(wishReplies)
    .values({
      wishId,
      authorId,
      body,
      nickname,
    })
    .returning({
      id: wishReplies.id,
      body: wishReplies.body,
      nickname: wishReplies.nickname,
      createdAt: wishReplies.createdAt,
    });

  const [author] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  return {
    id: created!.id,
    body: created!.body,
    displayName: created!.nickname ?? author!.displayName,
    createdAt: created!.createdAt.toISOString(),
  };
}