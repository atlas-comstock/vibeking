import Link from "next/link";
import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { TagFilter } from "@/components/TagFilter";
import { WishCard } from "@/components/WishCard";

export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

type Props = {
  searchParams: Promise<{ tag?: string; status?: string }>;
};

export default async function WishesPage({ searchParams }: Props) {
  const locale = await getLocale();
  const params = await searchParams;
  const [{ items }, { tags }] = await Promise.all([
    api
      .getWishes({ tag: params.tag, status: params.status, limit: 50 })
      .catch(() => ({ items: [], nextCursor: null, hasMore: false })),
    api.getTags().catch(() => ({ tags: [] })),
  ]);

  return (
    <>
      <Nav />
      <main className="container">
        <section className="page-hero">
          <h1>{t(labels.wish.pageTitle, locale)}</h1>
          <p className="hero-sub">{t(labels.wish.pageSub, locale)}</p>
        </section>

        <Suspense fallback={<div className="tag-filter" />}>
          <TagFilter tags={tags} locale={locale} />
        </Suspense>

        {items.length === 0 ? (
          <div className="empty-discover card">
            <span className="empty-discover-emoji">✦</span>
            <p className="empty-state" style={{ padding: "0 0 1rem" }}>
              {t(labels.wish.noWishes, locale)}
            </p>
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {items.map((wish) => (
              <WishCard key={wish.id} wish={wish} locale={locale} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}