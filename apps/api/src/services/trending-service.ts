import { desc, eq, isNull } from "drizzle-orm";
import { computeTrendingScore } from "@vibeking/shared";
import { deliverables, getDb, wishes } from "@vibeking/db";
import { getCache } from "../lib/cache.js";

const cache = getCache();
const STALE_AFTER_SECONDS = 300;

export type TrendingCachePayload = {
  items: Array<Record<string, unknown>>;
  computedAt: string;
  staleAfterSeconds: number;
};

export async function computeTrendingWishes(limit: number): Promise<TrendingCachePayload> {
  const db = getDb();
  const rows = await db
    .select()
    .from(wishes)
    .where(isNull(wishes.deletedAt))
    .orderBy(desc(wishes.createdAt))
    .limit(200);

  const scored = rows
    .map((wish) => ({
      wish,
      score: computeTrendingScore({
        likeCount: wish.likeCount,
        viewCount: wish.viewCount,
        createdAt: wish.createdAt,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ wish }) => ({
      id: wish.id,
      title: wish.title,
      tags: wish.tags,
      status: wish.status,
      likeCount: wish.likeCount,
      viewCount: wish.viewCount,
      createdAt: wish.createdAt.toISOString(),
    }));

  return {
    items: scored,
    computedAt: new Date().toISOString(),
    staleAfterSeconds: STALE_AFTER_SECONDS,
  };
}

export async function computeTrendingDeliverables(
  limit: number,
): Promise<TrendingCachePayload> {
  const db = getDb();
  const rows = await db
    .select({
      id: deliverables.id,
      slug: deliverables.slug,
      title: deliverables.title,
      kind: deliverables.kind,
      likeCount: deliverables.likeCount,
      viewCount: deliverables.viewCount,
      createdAt: deliverables.createdAt,
    })
    .from(deliverables)
    .where(eq(deliverables.status, "live"))
    .orderBy(desc(deliverables.createdAt))
    .limit(200);

  const scored = rows
    .map((item) => ({
      item,
      score: computeTrendingScore({
        likeCount: item.likeCount,
        viewCount: item.viewCount,
        createdAt: item.createdAt,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      kind: item.kind,
      likeCount: item.likeCount,
      viewCount: item.viewCount,
      createdAt: item.createdAt.toISOString(),
    }));

  return {
    items: scored,
    computedAt: new Date().toISOString(),
    staleAfterSeconds: STALE_AFTER_SECONDS,
  };
}

export async function refreshTrendingCache(): Promise<void> {
  const wishesPayload = await computeTrendingWishes(50);
  const deliverablesPayload = await computeTrendingDeliverables(50);
  await cache.set("trending:wishes", JSON.stringify(wishesPayload), 3600);
  await cache.set("trending:deliverables", JSON.stringify(deliverablesPayload), 3600);
}

export async function getTopLikedWishes(limit: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: wishes.id,
      title: wishes.title,
      description: wishes.description,
      tags: wishes.tags,
      status: wishes.status,
      likeCount: wishes.likeCount,
      viewCount: wishes.viewCount,
      createdAt: wishes.createdAt,
    })
    .from(wishes)
    .where(isNull(wishes.deletedAt))
    .orderBy(desc(wishes.likeCount), desc(wishes.createdAt))
    .limit(limit);

  return {
    items: rows.map((wish) => ({
      id: wish.id,
      title: wish.title,
      description: wish.description,
      tags: wish.tags,
      status: wish.status,
      likeCount: wish.likeCount,
      viewCount: wish.viewCount,
      createdAt: wish.createdAt.toISOString(),
      href: `/wishes/${wish.id}`,
    })),
  };
}

export async function getTopLikedDeliverables(limit: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: deliverables.id,
      slug: deliverables.slug,
      title: deliverables.title,
      description: deliverables.description,
      kind: deliverables.kind,
      externalUrl: deliverables.externalUrl,
      likeCount: deliverables.likeCount,
      viewCount: deliverables.viewCount,
      createdAt: deliverables.createdAt,
    })
    .from(deliverables)
    .where(eq(deliverables.status, "live"))
    .orderBy(desc(deliverables.likeCount), desc(deliverables.createdAt))
    .limit(limit);

  return {
    items: rows.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title || item.slug,
      description: item.description,
      kind: item.kind,
      likeCount: item.likeCount,
      viewCount: item.viewCount,
      createdAt: item.createdAt.toISOString(),
      href: `/deliverables/${item.slug}`,
      siteUrl:
        item.kind === "url" && item.externalUrl
          ? item.externalUrl
          : `https://${item.slug}.vibeking.dev/`,
    })),
  };
}

export async function getTrending(type: "wishes" | "deliverables", limit: number) {
  const key = `trending:${type}`;
  const raw = await cache.get(key);
  if (raw) {
    const payload = JSON.parse(raw) as TrendingCachePayload;
    return {
      ...payload,
      items: payload.items.slice(0, limit),
    };
  }

  const fresh =
    type === "wishes"
      ? await computeTrendingWishes(limit)
      : await computeTrendingDeliverables(limit);
  await cache.set(key, JSON.stringify(fresh), 3600);
  return fresh;
}

export async function getPopularTags(limit = 20) {
  const db = getDb();
  const rows = await db
    .select({ tags: wishes.tags })
    .from(wishes)
    .where(isNull(wishes.deletedAt))
    .limit(500);

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const tag of row.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function getItemsByTag(tag: string, limit = 20) {
  const db = getDb();
  const wishRows = await db
    .select()
    .from(wishes)
    .where(isNull(wishes.deletedAt))
    .limit(500);

  const matchedWishes = wishRows
    .filter((w) => w.tags.includes(tag))
    .slice(0, limit)
    .map((w) => ({
      id: w.id,
      title: w.title,
      status: w.status,
      likeCount: w.likeCount,
      viewCount: w.viewCount,
      createdAt: w.createdAt.toISOString(),
    }));

  return {
    tag,
    wishes: matchedWishes,
    deliverables: [] as Array<Record<string, unknown>>,
  };
}