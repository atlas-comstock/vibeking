import type { FeedCardItem } from "@/components/FeedCard";
import type { Locale } from "@/lib/locale";

export function getFeedPlaceholders(locale: Locale): FeedCardItem[] {
  const samples =
    locale === "zh"
      ? [
          { title: "奶油色作品集", emoji: "🧁", tag: "设计" },
          { title: "小红书风格落地页", emoji: "📕", tag: "模板" },
          { title: "Agent 发布的网页", emoji: "🌸", tag: "here.now" },
        ]
      : [
          { title: "Cream portfolio", emoji: "🧁", tag: "design" },
          { title: "Red-note style landing", emoji: "📕", tag: "template" },
          { title: "Agent-published site", emoji: "🌸", tag: "here.now" },
        ];

  return samples.map((s, i) => ({
    type: "site_post" as const,
    id: `placeholder-${i}`,
    title: s.title,
    description:
      locale === "zh"
        ? "用 Skill 发布你的第一个站点，它会出现在这里"
        : "Publish your first site via Skill — it will show up here",
    siteUrl: "https://here.now/",
    coverEmoji: s.emoji,
    tags: [s.tag],
    source: "here_now",
    likeCount: 0,
    viewCount: 0,
    href: "/skill",
  }));
}