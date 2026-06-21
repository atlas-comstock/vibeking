import Link from "next/link";
import { Nav } from "@/components/Nav";
import { EmptyDiscover } from "@/components/EmptyDiscover";
import { FeedCard } from "@/components/FeedCard";
import { ProductStory } from "@/components/ProductStory";
import { SiteFooter } from "@/components/SiteFooter";
import { TopLikedCard, type TopLikedDeliverableItem, type TopLikedWishItem } from "@/components/TopLikedCard";
import { api } from "@/lib/api";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const [topWishes, topDeliverables, feed] = await Promise.all([
    api.getTopLiked("wishes", 10).catch(() => ({ items: [] })),
    api.getTopLiked("deliverables", 10).catch(() => ({ items: [] })),
    api.getFeed(24, locale).catch(() => ({ items: [] })),
  ]);

  const wishItems = topWishes.items.map((item) => ({
    type: "wish" as const,
    id: String(item.id),
    title: String(item.title),
    description: String(item.description ?? ""),
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    coverUrl: item.coverUrl ? String(item.coverUrl) : null,
    likeCount: Number(item.likeCount ?? 0),
    viewCount: Number(item.viewCount ?? 0),
    href: String(item.href ?? `/wishes/${item.id}`),
  })) satisfies TopLikedWishItem[];

  const deliverableItems = topDeliverables.items.map((item) => ({
    type: "deliverable" as const,
    id: String(item.id),
    title: String(item.title),
    description: item.description ? String(item.description) : null,
    likeCount: Number(item.likeCount ?? 0),
    viewCount: Number(item.viewCount ?? 0),
    href: String(item.href ?? `/deliverables/${item.slug}`),
    siteUrl: item.siteUrl ? String(item.siteUrl) : undefined,
  })) satisfies TopLikedDeliverableItem[];

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
              <h2>{t(labels.home.topWishes, locale)}</h2>
              <p className="section-sub">{t(labels.home.topWishesSub, locale)}</p>
            </div>
            <Link href="/wishes" className="link-accent">
              {t(labels.home.viewAll, locale)} →
            </Link>
          </div>
          {wishItems.length === 0 ? (
            <p className="empty-state">{t(labels.wish.noWishes, locale)}</p>
          ) : (
            <div className="masonry">
              {wishItems.map((item, i) => (
                <TopLikedCard key={item.id} item={item} locale={locale} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <h2>{t(labels.home.topDeliverables, locale)}</h2>
              <p className="section-sub">{t(labels.home.topDeliverablesSub, locale)}</p>
            </div>
          </div>
          {deliverableItems.length === 0 ? (
            <p className="empty-state">{t(labels.home.noDeliverables, locale)}</p>
          ) : (
            <div className="masonry">
              {deliverableItems.map((item, i) => (
                <TopLikedCard key={item.id} item={item} locale={locale} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

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