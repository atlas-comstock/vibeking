import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";
import { CardCover } from "./CardCover";
import { LikeButton } from "./LikeButton";

export type TopLikedWishItem = {
  type: "wish";
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl?: string | null;
  likeCount: number;
  viewCount: number;
  href: string;
};

export type TopLikedDeliverableItem = {
  type: "deliverable";
  id: string;
  title: string;
  description?: string | null;
  siteUrl?: string;
  likeCount: number;
  viewCount: number;
  href: string;
};

type Props = {
  item: TopLikedWishItem | TopLikedDeliverableItem;
  locale: Locale;
  rank: number;
};

export function TopLikedCard({ item, locale, rank }: Props) {
  const typeLabel =
    item.type === "wish" ? t(labels.feed.wish, locale) : t(labels.feed.deliverable, locale);

  return (
    <article className="pin-card top-liked-card">
      <CardCover
        href={item.href}
        seed={item.id}
        type={item.type}
        title={item.title}
        tags={item.type === "wish" ? item.tags : undefined}
        siteUrl={item.type === "deliverable" ? item.siteUrl : undefined}
        coverUrl={item.type === "wish" ? item.coverUrl : undefined}
        rank={rank}
      />
      <div className="pin-body">
        <p className="pin-type">{typeLabel}</p>
        <h3 className="pin-title">
          <Link href={item.href}>{item.title}</Link>
        </h3>
        {item.description && <p className="pin-desc">{item.description}</p>}
        {item.type === "wish" && item.tags.length > 0 && (
          <div className="tag-row">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip tag-chip-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="pin-meta pin-meta-actions">
          <LikeButton
            targetType={item.type}
            targetId={item.id}
            initialCount={item.likeCount}
          />
          <span className="meta-muted">◎ {item.viewCount}</span>
        </div>
      </div>
    </article>
  );
}