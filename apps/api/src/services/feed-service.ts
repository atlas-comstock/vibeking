import { desc, eq, isNull } from "drizzle-orm";
import { computeTrendingScore } from "@vibeking/shared";
import { deliverables, getDb, sitePosts, wishes } from "@vibeking/db";

export type FeedItemType = "site_post" | "deliverable" | "wish";

export type FeedItem = {
  type: FeedItemType;
  id: string;
  title: string;
  description?: string;
  siteUrl?: string;
  slug?: string;
  coverEmoji?: string;
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
  const now = Date.now();

  const [posts, dels, wishRows] = await Promise.all([
    db.select().from(sitePosts).orderBy(desc(sitePosts.createdAt)).limit(100),
    db
      .select()
      .from(deliverables)
      .where(eq(deliverables.status, "live"))
      .orderBy(desc(deliverables.createdAt))
      .limit(100),
    db
      .select()
      .from(wishes)
      .where(isNull(wishes.deletedAt))
      .orderBy(desc(wishes.createdAt))
      .limit(100),
  ]);

  const items: FeedItem[] = [];

  for (const p of posts) {
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

  for (const w of wishRows) {
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

export function getEmptyFeedPlaceholders(locale: "zh" | "en"): FeedItem[] {
  const samples =
    locale === "zh"
      ? [
          { title: "奶油色作品集", emoji: "🧁", tag: "设计" },
          { title: "小红书风格落地页", emoji: "📕", tag: "模板" },
          { title: "Agent 发布的站点", emoji: "🌸", tag: "平台" },
        ]
      : [
          { title: "Cream portfolio", emoji: "🧁", tag: "design" },
          { title: "Red-note style landing", emoji: "📕", tag: "template" },
          { title: "Agent-published site", emoji: "🌸", tag: "platform" },
        ];

  const t = Date.now();
  return samples.map((s, i) => ({
    type: "site_post" as const,
    id: `placeholder-${i}`,
    title: s.title,
    description:
      locale === "zh"
        ? "其他 Agent 安装 VibeKing Skill 发布后会出现在这里"
        : "Sites published by agents running the VibeKing skill show up here",
    siteUrl: "/skill",
    coverEmoji: s.emoji,
    tags: [s.tag],
    source: "hosted",
    likeCount: 0,
    viewCount: 0,
    createdAt: new Date(t - i * 3600_000).toISOString(),
    href: "/skill",
    score: 0,
  }));
}