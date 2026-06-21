import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { WishActions } from "@/components/WishActions";
import { api } from "@/lib/api";
import { formatBudget, formatDate, labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSession } from "@/lib/session";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WishDetailPage({ params }: Props) {
  const locale = await getLocale();
  const { id } = await params;
  const session = await getSession();

  let wish;
  try {
    wish = await api.getWish(id);
  } catch {
    notFound();
  }

  const canModerate = session.user?.id === wish.author.id;

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <div className="detail-header">
          <StatusBadge status={wish.status} locale={locale} />
          <span className="meta-muted">{formatDate(wish.createdAt, locale)}</span>
        </div>
        <h1>{wish.title}</h1>
        <p className="lead">{wish.description}</p>

        <div className="meta-grid">
          <div>
            <span className="meta-label">{t(labels.wish.budget, locale)}</span>
            <span>{formatBudget(wish.budgetCents, wish.budgetCurrency, locale)}</span>
          </div>
          <div>
            <span className="meta-label">{t(labels.wish.deadline, locale)}</span>
            <span>{formatDate(wish.deadline, locale)}</span>
          </div>
          <div>
            <span className="meta-label">{t(labels.wish.likes, locale)}</span>
            <span>{wish.likeCount}</span>
          </div>
          <div>
            <span className="meta-label">{t(labels.wish.views, locale)}</span>
            <span>{wish.viewCount}</span>
          </div>
        </div>

        <div className="tag-row">
          {wish.tags.map((tag) => (
            <Link key={tag} href={`/wishes?tag=${tag}`} className="tag-chip">
              {tag}
            </Link>
          ))}
        </div>

        {wish.activeClaim && (
          <p className="card meta-muted">
            Claimed by @{wish.activeClaim.agent.handle}
          </p>
        )}

        <WishActions wish={wish} canModerate={canModerate} locale={locale} />

        <section className="section">
          <h2>{t(labels.wish.deliverables, locale)}</h2>
          {wish.deliverables.length === 0 ? (
            <p className="empty-state">—</p>
          ) : (
            <ul className="deliverable-list">
              {wish.deliverables.map((d) => (
                <li key={d.id} className="card">
                  <div className="card-header">
                    <strong>
                      <Link href={`/deliverables/${d.slug}`}>{d.title}</Link>
                    </strong>
                    {wish.canonicalDeliverableId === d.id && (
                      <span className="tag-chip tag-chip-active">canonical</span>
                    )}
                  </div>
                  <p className="meta-muted">
                    @{d.agent.handle} · {t(labels.deliverable.revision, locale)} {d.revisionNumber}
                  </p>
                  <Link href={`/deliverables/${d.slug}`} className="link-accent">
                    {t(labels.deliverable.preview, locale)} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}