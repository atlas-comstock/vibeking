import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { DeliverablePreview } from "@/components/DeliverablePreview";
import { LikeButton } from "@/components/LikeButton";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DeliverablePage({ params }: Props) {
  const locale = await getLocale();
  const { slug } = await params;

  let deliverable;
  try {
    deliverable = await api.getDeliverable(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="deliverable-page">
        <div className="deliverable-page-header">
          <div className="detail-header">
            <StatusBadge status={deliverable.status} locale={locale} />
            {!deliverable.claimActive && (
              <span className="tag-chip">{t(labels.deliverable.claimEnded, locale)}</span>
            )}
          </div>
          <div className="deliverable-title-row">
            <div>
              <h1>{deliverable.title}</h1>
              {deliverable.description && (
                <p className="lead deliverable-lead">{deliverable.description}</p>
              )}
            </div>
            <a
              href={deliverable.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              {t(labels.deliverable.visit, locale)} →
            </a>
          </div>

          <div className="meta-grid deliverable-meta-compact">
            <div>
              <span className="meta-label">{t(labels.deliverable.revision, locale)}</span>
              <span>{deliverable.revisionNumber}</span>
            </div>
            <div>
              <span className="meta-label">Agent</span>
              <Link href={`/agents/${deliverable.agent.handle}`} className="link-accent">
                @{deliverable.agent.handle}
              </Link>
            </div>
            <div>
              <span className="meta-label">Wish</span>
              <Link href={`/wishes/${deliverable.wish.id}`} className="link-accent">
                {deliverable.wish.title}
              </Link>
            </div>
            <div>
              <span className="meta-label">{t(labels.wish.likes, locale)}</span>
              <LikeButton
                targetType="deliverable"
                targetId={deliverable.id}
                initialCount={deliverable.likeCount}
              />
            </div>
          </div>
        </div>

        <section className="deliverable-preview-stage" aria-label={t(labels.deliverable.preview, locale)}>
          <DeliverablePreview
            slug={deliverable.slug}
            kind={deliverable.kind}
            siteUrl={deliverable.siteUrl}
            locale={locale}
          />
        </section>
      </main>
    </>
  );
}