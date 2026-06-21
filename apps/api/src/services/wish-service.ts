import { and, desc, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { buildSiteUrl } from "@vibeking/publish";
import {
  AppError,
  WishStatus,
  validatePatchFields,
  type DeliverableSummary,
  type WishPatchFields,
} from "@vibeking/shared";
import {
  deliverables,
  getDb,
  wishes,
  users,
  wishClaims,
  agentProfiles,
} from "@vibeking/db";
import { config } from "../config.js";
import { decodeCursor, encodeCursor } from "../lib/cursor.js";

export type CreateWishInput = {
  title: string;
  description: string;
  tags?: string[];
  coverUrl?: string | null;
  budgetCents?: number | null;
  budgetCurrency?: string;
  deadline?: string | null;
};

function normalizeCoverUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
    return parsed.href;
  } catch {
    throw new AppError("VALIDATION_ERROR", "配图链接格式不对", 400);
  }
}

export type ListWishesQuery = {
  limit: number;
  cursor?: string;
  status?: string;
  tag?: string;
  sort?: string;
};

type ActiveClaimRow = {
  id: string;
  agentId: string;
  agentHandle: string | null;
  agentDisplayName: string;
  claimedAt: Date;
  lastActivityAt: Date;
};

function mapActiveClaim(claim: ActiveClaimRow | null | undefined) {
  if (!claim) return null;
  return {
    id: claim.id,
    agentId: claim.agentId,
    agent: {
      handle: claim.agentHandle ?? "agent",
      displayName: claim.agentDisplayName,
    },
    claimedAt: claim.claimedAt.toISOString(),
    lastActivityAt: claim.lastActivityAt.toISOString(),
  };
}

type DeliverableRow = {
  id: string;
  slug: string;
  kind: typeof deliverables.$inferSelect.kind;
  title: string;
  externalUrl: string | null;
  revisionNumber: number;
  status: typeof deliverables.$inferSelect.status;
  likeCount: number;
  viewCount: number;
  createdAt: Date;
  agentHandle: string | null;
  agentDisplayName: string;
};

function mapDeliverableSummary(row: DeliverableRow): DeliverableSummary {
  const siteUrl =
    row.kind === "url" && row.externalUrl
      ? row.externalUrl
      : buildSiteUrl(row.slug, config.siteBaseDomain);

  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    siteUrl,
    revisionNumber: row.revisionNumber,
    status: row.status,
    likeCount: row.likeCount,
    viewCount: row.viewCount,
    agent: {
      handle: row.agentHandle ?? "agent",
      displayName: row.agentDisplayName,
    },
    createdAt: row.createdAt.toISOString(),
  };
}

function mapWishRow(
  wish: typeof wishes.$inferSelect,
  author: { id: string; displayName: string },
  activeClaim?: ActiveClaimRow | null,
  deliverableItems: DeliverableSummary[] = [],
) {
  return {
    id: wish.id,
    title: wish.title,
    description: wish.description,
    tags: wish.tags,
    coverUrl: wish.coverUrl ?? null,
    budgetCents: wish.budgetCents,
    budgetCurrency: wish.budgetCurrency,
    deadline: wish.deadline?.toISOString() ?? null,
    status: wish.status,
    author: {
      id: author.id,
      displayName: author.displayName,
    },
    activeClaim: mapActiveClaim(activeClaim),
    deliverables: deliverableItems,
    canonicalDeliverableId: wish.acceptedDeliverableId,
    likeCount: wish.likeCount,
    viewCount: wish.viewCount,
    createdAt: wish.createdAt.toISOString(),
  };
}

export async function createWish(authorId: string, input: CreateWishInput) {
  const title = input.title?.trim();
  const description = input.description?.trim();
  if (!title || !description) {
    throw new AppError("VALIDATION_ERROR", "标题和描述不能为空", 400);
  }
  if (
    input.budgetCents != null &&
    (Number.isNaN(input.budgetCents) || input.budgetCents < 0)
  ) {
    throw new AppError("VALIDATION_ERROR", "预算格式不对", 400);
  }
  let deadline: Date | null = null;
  if (input.deadline) {
    deadline = new Date(input.deadline);
    if (Number.isNaN(deadline.getTime())) {
      throw new AppError("VALIDATION_ERROR", "日期格式不对", 400);
    }
  }

  const coverUrl = normalizeCoverUrl(input.coverUrl);

  const db = getDb();
  const [created] = await db
    .insert(wishes)
    .values({
      authorId,
      title,
      description,
      tags: input.tags ?? [],
      coverUrl,
      budgetCents: input.budgetCents ?? null,
      budgetCurrency: input.budgetCurrency ?? "CNY",
      deadline,
      status: WishStatus.OPEN,
    })
    .returning();

  const [author] = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  return mapWishRow(created!, author!);
}

export async function listWishes(query: ListWishesQuery) {
  const db = getDb();
  const conditions = [isNull(wishes.deletedAt)];

  if (query.status) {
    conditions.push(eq(wishes.status, query.status as WishStatus));
  }

  if (query.tag) {
    conditions.push(sql`${query.tag} = ANY(${wishes.tags})`);
  }

  if (query.cursor) {
    const decoded = decodeCursor(query.cursor);
    const createdAt = new Date(decoded.createdAt);
    if (query.sort === "created_at_asc") {
      conditions.push(
        or(
          gt(wishes.createdAt, createdAt),
          and(eq(wishes.createdAt, createdAt), gt(wishes.id, decoded.id)),
        )!,
      );
    } else {
      conditions.push(
        or(
          lt(wishes.createdAt, createdAt),
          and(eq(wishes.createdAt, createdAt), lt(wishes.id, decoded.id)),
        )!,
      );
    }
  }

  const rows = await db
    .select({
      wish: wishes,
      authorId: users.id,
      authorDisplayName: users.displayName,
    })
    .from(wishes)
    .innerJoin(users, eq(wishes.authorId, users.id))
    .where(and(...conditions))
    .orderBy(
      ...(query.sort === "created_at_asc"
        ? [wishes.createdAt, wishes.id]
        : query.sort === "deadline_asc"
          ? [wishes.deadline, wishes.id]
          : [desc(wishes.createdAt), desc(wishes.id)]),
    )
    .limit(query.limit + 1);

  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;

  const items = page.map((r) =>
    mapWishRow(r.wish, { id: r.authorId, displayName: r.authorDisplayName }),
  );

  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({
          createdAt: last.wish.createdAt.toISOString(),
          id: last.wish.id,
        })
      : null;

  return { items, nextCursor, hasMore };
}

export async function getWishById(wishId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      wish: wishes,
      authorId: users.id,
      authorDisplayName: users.displayName,
    })
    .from(wishes)
    .innerJoin(users, eq(wishes.authorId, users.id))
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .limit(1);

  if (!row) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  const [claim] = await db
    .select({
      id: wishClaims.id,
      agentId: wishClaims.agentId,
      claimedAt: wishClaims.claimedAt,
      lastActivityAt: wishClaims.lastActivityAt,
      agentHandle: agentProfiles.handle,
      agentDisplayName: users.displayName,
    })
    .from(wishClaims)
    .innerJoin(users, eq(users.id, wishClaims.agentId))
    .leftJoin(agentProfiles, eq(agentProfiles.userId, wishClaims.agentId))
    .where(and(eq(wishClaims.wishId, wishId), eq(wishClaims.status, "active")))
    .limit(1);

  const deliverableRows = await db
    .select({
      id: deliverables.id,
      slug: deliverables.slug,
      kind: deliverables.kind,
      title: deliverables.title,
      externalUrl: deliverables.externalUrl,
      revisionNumber: deliverables.revisionNumber,
      status: deliverables.status,
      likeCount: deliverables.likeCount,
      viewCount: deliverables.viewCount,
      createdAt: deliverables.createdAt,
      agentHandle: agentProfiles.handle,
      agentDisplayName: users.displayName,
    })
    .from(deliverables)
    .innerJoin(users, eq(deliverables.agentId, users.id))
    .leftJoin(agentProfiles, eq(agentProfiles.userId, users.id))
    .where(eq(deliverables.wishId, wishId))
    .orderBy(desc(deliverables.revisionNumber));

  return mapWishRow(
    row.wish,
    { id: row.authorId, displayName: row.authorDisplayName },
    claim
      ? {
          id: claim.id,
          agentId: claim.agentId,
          agentHandle: claim.agentHandle,
          agentDisplayName: claim.agentDisplayName,
          claimedAt: claim.claimedAt,
          lastActivityAt: claim.lastActivityAt,
        }
      : null,
    deliverableRows.map(mapDeliverableSummary),
  );
}

export async function patchWish(
  wishId: string,
  authorId: string,
  patch: WishPatchFields,
) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(wishes)
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .limit(1);

  if (!existing) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  if (existing.authorId !== authorId) {
    throw new AppError("FORBIDDEN", "Only the author can edit this wish", 403);
  }

  validatePatchFields(existing.status as WishStatus, patch);

  const updates: Partial<typeof wishes.$inferInsert> = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.tags !== undefined) updates.tags = patch.tags;
  if (patch.coverUrl !== undefined) updates.coverUrl = normalizeCoverUrl(patch.coverUrl);
  if (patch.budgetCents !== undefined) updates.budgetCents = patch.budgetCents;
  if (patch.budgetCurrency !== undefined) updates.budgetCurrency = patch.budgetCurrency;
  if (patch.deadline !== undefined) {
    updates.deadline = patch.deadline ? new Date(patch.deadline) : null;
  }

  const [updated] = await db
    .update(wishes)
    .set(updates)
    .where(eq(wishes.id, wishId))
    .returning();

  return getWishById(updated!.id);
}

export async function deleteWish(wishId: string, authorId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(wishes)
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .limit(1);

  if (!existing) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  if (existing.authorId !== authorId) {
    throw new AppError("FORBIDDEN", "Only the author can delete this wish", 403);
  }

  if (existing.status !== WishStatus.OPEN) {
    throw new AppError("WISH_NOT_OPEN", "Only open wishes can be cancelled", 400);
  }

  await db
    .update(wishes)
    .set({ deletedAt: new Date() })
    .where(eq(wishes.id, wishId));
}