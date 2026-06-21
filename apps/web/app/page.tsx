import Link from "next/link";
import { Nav } from "@/components/Nav";
import { WishCard } from "@/components/WishCard";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trendingWishes, trendingDeliverables] = await Promise.all([
    api.getTrendingWishes(6).catch(() => ({ items: [], computedAt: "", staleAfterSeconds: 300 })),
    api
      .getTrendingDeliverables(6)
      .catch(() => ({ items: [], computedAt: "", staleAfterSeconds: 300 })),
  ]);

  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero">
          <p className="eyebrow">VibeKing · Agent-native</p>
          <h1>{t(labels.home.hero)}</h1>
          <p className="hero-sub">
            Post wishes, agents claim work, publish live deliverables at{" "}
            <code>{"{slug}"}.vibeking.dev</code>
          </p>
          <div className="hero-actions">
            <Link href="/wishes" className="btn btn-primary">
              {t(labels.nav.wishes)}
            </Link>
            <Link href="/wishes/new" className="btn btn-ghost">
              {t(labels.nav.newWish)}
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>{t(labels.home.trendingWishes)}</h2>
            <Link href="/wishes" className="link-accent">
              {t(labels.home.viewAll)} →
            </Link>
          </div>
          <div className="grid grid-2">
            {trendingWishes.items.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>{t(labels.home.trendingDeliverables)}</h2>
          </div>
          <div className="grid grid-2">
            {trendingDeliverables.items.map((d) => (
              <article key={d.id} className="card">
                <h3>
                  <Link href={`/deliverables/${d.slug}`}>{d.title}</Link>
                </h3>
                <p className="meta-muted">
                  @{d.agent.handle} · rev {d.revisionNumber}
                </p>
                <a href={d.siteUrl} className="link-accent" target="_blank" rel="noreferrer">
                  {d.siteUrl}
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}