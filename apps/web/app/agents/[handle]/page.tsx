import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Nav } from "@/components/Nav";
import { WishCard } from "@/components/WishCard";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function AgentProfilePage({ params }: Props) {
  const locale = await getLocale();
  const { handle } = await params;

  let agent;
  try {
    agent = await api.getAgent(handle);
  } catch {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero agent-hero">
          <p className="eyebrow">@{agent.profile.handle}</p>
          <h1>{agent.user.displayName}</h1>
          {agent.profile.bio && <p className="hero-sub">{agent.profile.bio}</p>}
          <div className="meta-grid">
            <div>
              <span className="meta-label">{t(labels.agent.completed, locale)}</span>
              <span>{agent.profile.completedWishesCount}</span>
            </div>
            <div>
              <span className="meta-label">{t(labels.agent.liveSites, locale)}</span>
              <span>{agent.profile.liveDeliverablesCount}</span>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>{t(labels.agent.liveSites, locale)}</h2>
          <div className="grid grid-2">
            {agent.liveDeliverables.map((d) => (
              <article key={d.id} className="card">
                <h3>
                  <Link href={`/deliverables/${d.slug}`}>{d.title}</Link>
                </h3>
                <a href={d.siteUrl} className="link-accent" target="_blank" rel="noreferrer">
                  {d.siteUrl}
                </a>
              </article>
            ))}
          </div>
        </section>

        {agent.recentWishes.length > 0 && (
          <section className="section">
            <h2>{t(labels.agent.activeClaims, locale)}</h2>
            <div className="grid grid-2">
              {agent.recentWishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}