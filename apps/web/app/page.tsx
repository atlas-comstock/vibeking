import Link from "next/link";
import { Nav } from "@/components/Nav";
import { FeedCard } from "@/components/FeedCard";
import { api } from "@/lib/api";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const feed = await api.getFeed(24, locale).catch(() => ({ items: [] }));
  const items = feed.items;

  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero hero-cute">
          <p className="eyebrow">VibeKing ✿ {t(labels.home.eyebrow, locale)}</p>
          <h1>{t(labels.home.hero, locale)}</h1>
          <p className="hero-sub">{t(labels.home.heroSub, locale)}</p>
          <div className="hero-actions">
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
            <Link href="/skill" className="btn btn-ghost">
              {t(labels.nav.skill, locale)}
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>{t(labels.home.discover, locale)}</h2>
            <Link href="/wishes" className="link-accent">
              {t(labels.home.viewAll, locale)} →
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="empty-state-card card">
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
          ) : (
            <div className="masonry">
              {items.map((item, i) => (
                <FeedCard key={`${item.type}-${item.id}`} item={item} locale={locale} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}