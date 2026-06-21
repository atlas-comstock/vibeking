import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";
import { CardCover } from "./CardCover";

export type FeedCardItem = {
  type: "site_post" | "deliverable" | "wish";
  id: string;
  title: string;
  description?: string;
  siteUrl?: string;
  coverEmoji?: string;
  coverUrl?: string | null;
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

function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
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
    <article className="pin-card app-card" style={{ animationDelay: `${(index % 8) * 40}ms` }}>
      <div className="app-card-cover-wrap">
        <CardCover
          href={item.href}
          seed={item.id}
          type={item.type}
          title={item.title}
          tags={item.tags}
          siteUrl={item.siteUrl}
          coverEmoji={item.coverEmoji}
          coverUrl={item.coverUrl}
        />
        <span className="app-card-type">{t(TYPE_LABEL[item.type], locale)}</span>
      </div>
      <div className="pin-body app-card-body">
        <h3 className="pin-title">
          <CardLink href={item.href}>{item.title}</CardLink>
        </h3>
        {item.description && <p className="pin-desc app-card-desc">{item.description}</p>}
        {item.tags.length > 0 && (
          <div className="tag-row">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip tag-chip-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="pin-meta app-card-meta">
          <span className="app-card-likes">♡ {item.likeCount}</span>
          <span className="app-card-views">◎ {item.viewCount}</span>
        </div>
      </div>
    </article>
  );
}