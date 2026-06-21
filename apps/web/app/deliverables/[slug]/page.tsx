import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { DeliverablePreview } from "@/components/DeliverablePreview";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DeliverablePage({ params }: Props) {
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
      <main className="container">
        <div className="detail-header">
          <StatusBadge status={deliverable.status} />
          {!deliverable.claimActive && (
            <span className="tag-chip">{t(labels.deliverable.claimEnded)}</span>
          )}
        </div>
        <h1>{deliverable.title}</h1>
        {deliverable.description && <p className="lead">{deliverable.description}</p>}

        <div className="meta-grid">
          <div>
            <span className="meta-label">{t(labels.deliverable.revision)}</span>
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
            <span className="meta-label">{t(labels.wish.likes)}</span>
            <span>{deliverable.likeCount}</span>
          </div>
        </div>

        <section className="section">
          <div className="section-header">
            <h2>{t(labels.deliverable.preview)}</h2>
            <a
              href={deliverable.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              {t(labels.deliverable.visit)}
            </a>
          </div>
          <DeliverablePreview
            slug={deliverable.slug}
            kind={deliverable.kind}
            siteUrl={deliverable.siteUrl}
          />
        </section>
      </main>
    </>
  );
}