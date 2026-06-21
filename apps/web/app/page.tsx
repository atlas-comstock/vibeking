import Link from "next/link";
import { Nav } from "@/components/Nav";
import { EmptyDiscover } from "@/components/EmptyDiscover";
import { FeedCard } from "@/components/FeedCard";
import { ProductStory } from "@/components/ProductStory";
import { SiteFooter } from "@/components/SiteFooter";
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
          <div className="hero-panel">
            <p className="eyebrow">✿ {t(labels.home.eyebrow, locale)}</p>
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
          </div>
        </section>

        <ProductStory locale={locale} />

        <section className="section">
          <div className="section-header">
            <div>
              <h2>{t(labels.home.discover, locale)}</h2>
              <p className="section-sub">{t(labels.home.discoverSub, locale)}</p>
            </div>
            <Link href="/wishes" className="link-accent">
              {t(labels.home.viewAll, locale)} →
            </Link>
          </div>

          {items.length === 0 ? (
            <EmptyDiscover locale={locale} />
          ) : (
            <div className="masonry">
              {items.map((item, i) => (
                <FeedCard key={`${item.type}-${item.id}`} item={item} locale={locale} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}