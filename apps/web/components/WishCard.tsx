import Link from "next/link";
import type { Wish } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { formatBudget, formatDate, labels, t } from "@/lib/i18n";
import { CardCover } from "./CardCover";
import { LikeButton } from "./LikeButton";
import { StatusBadge } from "./StatusBadge";

export function WishCard({ wish, locale }: { wish: Wish; locale: Locale }) {
  return (
    <article className="card wish-card wish-card-with-cover">
      <CardCover
        href={`/wishes/${wish.id}`}
        seed={wish.id}
        type="wish"
        title={wish.title}
        tags={wish.tags}
        coverUrl={wish.coverUrl}
      />
      <div className="card-header">
        <StatusBadge status={wish.status} locale={locale} />
        <span className="meta-muted">{formatDate(wish.createdAt, locale)}</span>
      </div>
      <h3>
        <Link href={`/wishes/${wish.id}`}>{wish.title}</Link>
      </h3>
      <p className="card-desc">{wish.description}</p>
      <div className="tag-row">
        {wish.tags.map((tag) => (
          <span key={tag} className="tag-chip tag-chip-sm">
            #{tag}
          </span>
        ))}
      </div>
      <div className="card-footer card-footer-actions">
        <span>
          {t(labels.wish.budget, locale)}: {formatBudget(wish.budgetCents, wish.budgetCurrency, locale)}
        </span>
        <div className="card-actions">
          <LikeButton targetType="wish" targetId={wish.id} initialCount={wish.likeCount} />
          <span className="meta-muted">◎ {wish.viewCount}</span>
        </div>
      </div>
    </article>
  );
}