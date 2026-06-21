import { desc, eq, isNull } from "drizzle-orm";
import { computeTrendingScore } from "@vibeking/shared";
import { deliverables, getDb, sitePosts, wishes } from "@vibeking/db";

export type FeedItemType = "site_post" | "deliverable" | "wish";

export function normalizeFeedSiteUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    const path = parsed.pathname.replace(/\/+$/, "") || "";
    return `${parsed.protocol}//${parsed.host}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase().replace(/\/+$/, "");
  }
}

export type FeedItem = {
  type: FeedItemType;
  id: string;
  title: string;
  description?: string;
  siteUrl?: string;
  slug?: string;
  coverEmoji?: string;
  coverUrl?: string | null;
  tags: string[];
  source?: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  href: string;
  score: number;
};

export async function getDiscoverFeed(limit = 24): Promise<{ items: FeedItem[] }> {
  const db = getDb();

  const [postsResult, delsResult, wishesResult] = await Promise.allSettled([
    db.select().from(sitePosts).orderBy(desc(sitePosts.createdAt)).limit(100),
    db
      .select({
        id: deliverables.id,
        wishId: deliverables.wishId,
        slug: deliverables.slug,
        kind: deliverables.kind,
        title: deliverables.title,
        description: deliverables.description,
        externalUrl: deliverables.externalUrl,
        likeCount: deliverables.likeCount,
        viewCount: deliverables.viewCount,
        createdAt: deliverables.createdAt,
      })
      .from(deliverables)
      .where(eq(deliverables.status, "live"))
      .orderBy(desc(deliverables.createdAt))
      .limit(100),
    db
      .select({
        id: wishes.id,
        title: wishes.title,
        description: wishes.description,
        tags: wishes.tags,
        coverUrl: wishes.coverUrl,
        likeCount: wishes.likeCount,
        viewCount: wishes.viewCount,
        createdAt: wishes.createdAt,
      })
      .from(wishes)
      .where(isNull(wishes.deletedAt))
      .orderBy(desc(wishes.createdAt))
      .limit(100),
  ]);

  const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
  const dels = delsResult.status === "fulfilled" ? delsResult.value : [];
  const wishRows = wishesResult.status === "fulfilled" ? wishesResult.value : [];

  if (postsResult.status === "rejected") {
    console.error("feed: site_posts query failed", postsResult.reason);
  }
  if (delsResult.status === "rejected") {
    console.error("feed: deliverables query failed", delsResult.reason);
  }
  if (wishesResult.status === "rejected") {
    console.error("feed: wishes query failed", wishesResult.reason);
  }

  const items: FeedItem[] = [];
  const deliverableSiteUrls = new Set<string>();
  const deliverableWishIds = new Set<string>();

  for (const d of dels) {
    const score = computeTrendingScore({
      likeCount: d.likeCount,
      viewCount: d.viewCount,
      createdAt: d.createdAt,
    });
    const siteUrl =
      d.kind === "url" && d.externalUrl
        ? d.externalUrl
        : `https://${d.slug}.vibeking.dev/`;
    deliverableSiteUrls.add(normalizeFeedSiteUrl(siteUrl));
    deliverableWishIds.add(d.wishId);
    items.push({
      type: "deliverable",
      id: d.id,
      title: d.title || d.slug,
      description: d.description ?? undefined,
      siteUrl,
      slug: d.slug,
      coverEmoji: "🎀",
      tags: [],
      source: d.kind,
      likeCount: d.likeCount,
      viewCount: d.viewCount,
      createdAt: d.createdAt.toISOString(),
      href: `/deliverables/${d.slug}`,
      score,
    });
  }

  for (const p of posts) {
    if (deliverableSiteUrls.has(normalizeFeedSiteUrl(p.siteUrl))) {
      continue;
    }
    const score = computeTrendingScore({
      likeCount: p.likeCount,
      viewCount: p.viewCount,
      createdAt: p.createdAt,
    });
    items.push({
      type: "site_post",
      id: p.id,
      title: p.title,
      description: p.description ?? undefined,
      siteUrl: p.siteUrl,
      slug: p.slug ?? undefined,
      coverEmoji: p.coverEmoji ?? "✨",
      tags: p.tags,
      source: p.source,
      likeCount: p.likeCount,
      viewCount: p.viewCount,
      createdAt: p.createdAt.toISOString(),
      href: p.siteUrl,
      score,
    });
  }

  for (const w of wishRows) {
    if (deliverableWishIds.has(w.id)) {
      continue;
    }
    const score = computeTrendingScore({
      likeCount: w.likeCount,
      viewCount: w.viewCount,
      createdAt: w.createdAt,
    });
    items.push({
      type: "wish",
      id: w.id,
      title: w.title,
      description: w.description,
      coverEmoji: "💫",
      coverUrl: w.coverUrl ?? null,
      tags: w.tags,
      likeCount: w.likeCount,
      viewCount: w.viewCount,
      createdAt: w.createdAt.toISOString(),
      href: `/wishes/${w.id}`,
      score,
    });
  }

  items.sort((a, b) => b.score - a.score);

  return { items: items.slice(0, limit) };
}