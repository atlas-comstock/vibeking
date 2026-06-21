import { Suspense } from "react";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";
import { TagFilter } from "@/components/TagFilter";
import { WishCard } from "@/components/WishCard";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ tag?: string; status?: string }>;
};

export default async function WishesPage({ searchParams }: Props) {
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
          <h1>{t(labels.nav.wishes)}</h1>
        </div>
        <Suspense fallback={<div className="tag-filter" />}>
          <TagFilter tags={tags} />
        </Suspense>
        {items.length === 0 ? (
          <p className="empty-state">{t(labels.wish.noWishes)}</p>
        ) : (
          <div className="grid grid-2">
            {items.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}