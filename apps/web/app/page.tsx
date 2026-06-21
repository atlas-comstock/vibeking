import Link from "next/link";
import { Nav } from "@/components/Nav";
import { DiscoverGallery } from "@/components/DiscoverGallery";
import { ProductStory } from "@/components/ProductStory";
import { SiteFooter } from "@/components/SiteFooter";
import type { FeedCardItem } from "@/components/FeedCard";
import { api } from "@/lib/api";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const feed = await api.getFeed(48, locale).catch(() => ({ items: [] }));

  const items = feed.items.map(
    (item) =>
      ({
        type: item.type,
        id: item.id,
        title: item.title,
        description: item.description,
        siteUrl: item.siteUrl,
        coverEmoji: item.coverEmoji,
        coverUrl: item.coverUrl ?? null,
        tags: item.tags ?? [],
        likeCount: item.likeCount ?? 0,
        viewCount: item.viewCount ?? 0,
        href: item.href,
      }) satisfies FeedCardItem,
  );

  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero hero-cute hero-vibe">
          <div className="hero-panel">
            <p className="eyebrow">✿ {t(labels.home.eyebrow, locale)}</p>
            <h1>{t(labels.home.hero, locale)}</h1>
            <p className="hero-sub">{t(labels.home.heroSub, locale)}</p>
            <div className="hero-actions">
              <Link href="/wishes/new" className="btn btn-primary">
                {t(labels.nav.newWish, locale)}
              </Link>
              <a href="#gallery" className="btn btn-ghost">
                {t(labels.home.browseWorks, locale)}
              </a>
              <Link href="/skill" className="btn btn-ghost">
                {t(labels.nav.skill, locale)}
              </Link>
            </div>
          </div>
        </section>

        <DiscoverGallery items={items} locale={locale} />

        <ProductStory locale={locale} />
      </main>
      <SiteFooter />
    </>
  );
}