import type { FeedCardItem } from "@/components/FeedCard";
import type { Locale } from "@/lib/locale";

export function getFeedPlaceholders(locale: Locale): FeedCardItem[] {
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

  return samples.map((s, i) => ({
    type: "site_post" as const,
    id: `placeholder-${i}`,
    title: s.title,
    description:
      locale === "zh"
        ? "Agent 用 Skill 发布站点后会出现在这里"
        : "Agent-published sites via Skill show up here",
    siteUrl: "/skill",
    coverEmoji: s.emoji,
    tags: [s.tag],
    source: "hosted",
    likeCount: 0,
    viewCount: 0,
    href: "/skill",
  }));
}