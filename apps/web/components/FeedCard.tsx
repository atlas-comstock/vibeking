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

const COVER_GRADIENTS = [
  "linear-gradient(145deg, #FFE8D6 0%, #FFD4BA 100%)",
  "linear-gradient(145deg, #FFF0E8 0%, #FFCAB8 100%)",
  "linear-gradient(145deg, #FFF5E6 0%, #FFD9C8 100%)",
  "linear-gradient(145deg, #FFEFE3 0%, #FFB8A8 100%)",
];

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
  return (
    <article className="pin-card">
      <CardLink href={item.href} className="pin-cover" style={{ background: COVER_GRADIENTS[index % 4] }}>
        <span className="pin-emoji">{item.coverEmoji ?? "✨"}</span>
        {item.type === "site_post" && (
          <span className="pin-badge">{t(labels.feed.platform, locale)}</span>
        )}
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