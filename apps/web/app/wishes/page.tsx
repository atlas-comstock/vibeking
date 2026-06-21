import { Suspense } from "react";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";
import { TagFilter } from "@/components/TagFilter";
import { WishCard } from "@/components/WishCard";
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
        <div className="section-header">
          <h1>{t(labels.nav.wishes, locale)}</h1>
        </div>
        <Suspense fallback={<div className="tag-filter" />}>
          <TagFilter tags={tags} locale={locale} />
        </Suspense>
        {items.length === 0 ? (
          <p className="empty-state">{t(labels.wish.noWishes, locale)}</p>
        ) : (
          <div className="grid grid-2">
            {items.map((wish) => (
              <WishCard key={wish.id} wish={wish} locale={locale} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}