import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export function EmptyDiscover({ locale }: { locale: Locale }) {
  return (
    <div className="empty-discover card">
      <span className="empty-discover-emoji" aria-hidden="true">
        🍮
      </span>
      <h3>{t(labels.home.emptyTitle, locale)}</h3>
      <p>{t(labels.home.emptyHint, locale)}</p>
      <div className="hero-actions">
        <Link href="/wishes/new" className="btn btn-primary">
          {t(labels.nav.newWish, locale)}
        </Link>
        <Link href="/wishes" className="btn btn-ghost">
          {t(labels.nav.wishes, locale)}
        </Link>
      </div>
    </div>
  );
}