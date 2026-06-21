import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export type FeedCardItem = {
  type: "site_post" | "deliverable" | "wish";
  id: string;
  title: string;
  description?: string;
  siteUrl?: string;
  coverEmoji?: string;
  tags: string[];
  source?: string;
  likeCount: number;
  viewCount: number;
  href: string;
};

const TYPE_LABEL = {
  site_post: labels.feed.site,
  deliverable: labels.feed.deliverable,
  wish: labels.feed.wish,
} as const;

const TYPE_EMOJI = {
  site_post: "🌐",
  deliverable: "🎀",
  wish: "💫",
} as const;

function CardLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} style={style} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export function FeedCard({
  item,
  locale,
  index = 0,
}: {
  item: FeedCardItem;
  locale: Locale;
  index?: number;
}) {
  const emoji = item.coverEmoji ?? TYPE_EMOJI[item.type];

  return (
    <article className="pin-card" style={{ animationDelay: `${(index % 8) * 40}ms` }}>
      <CardLink
        href={item.href}
        className={`pin-cover pin-cover-type-${item.type}`}
      >
        <span className="pin-emoji">{emoji}</span>
      </CardLink>
      <div className="pin-body">
        <p className="pin-type">{t(TYPE_LABEL[item.type], locale)}</p>
        <h3 className="pin-title">
          <CardLink href={item.href}>{item.title}</CardLink>
        </h3>
        {item.description && <p className="pin-desc">{item.description}</p>}
        {item.tags.length > 0 && (
          <div className="tag-row">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip tag-chip-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="pin-meta">
          <span>
            ♡ {item.likeCount} · ◎ {item.viewCount}
          </span>
        </div>
      </div>
    </article>
  );
}