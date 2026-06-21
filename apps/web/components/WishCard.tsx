import Link from "next/link";
import type { Wish } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { formatBudget, formatDate, labels, t } from "@/lib/i18n";
import { StatusBadge } from "./StatusBadge";

export function WishCard({ wish, locale }: { wish: Wish; locale: Locale }) {
  return (
    <article className="card wish-card">
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
      <div className="card-footer">
        <span>
          {t(labels.wish.budget, locale)}: {formatBudget(wish.budgetCents, wish.budgetCurrency, locale)}
        </span>
        <span>
          ♡ {wish.likeCount} · ◎ {wish.viewCount}
        </span>
      </div>
    </article>
  );
}