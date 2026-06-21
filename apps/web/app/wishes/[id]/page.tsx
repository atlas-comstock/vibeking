import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { CoverHero } from "@/components/CoverHero";
import { Nav } from "@/components/Nav";
import { StatusBadge } from "@/components/StatusBadge";
import { LikeButton } from "@/components/LikeButton";
import { WishActions } from "@/components/WishActions";
import { WishReplies } from "@/components/WishReplies";
import { api, ApiClientError, buildCookieHeader } from "@/lib/api";
import { formatBudget, formatDate, labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSession } from "@/lib/session";

function resolveClientIp(headerStore: Awaited<ReturnType<typeof headers>>) {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined
  );
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ replyError?: string }>;
};

export default async function WishDetailPage({ params, searchParams }: Props) {
  const locale = await getLocale();
  const { id } = await params;
  const query = await searchParams;
  const session = await getSession();

  let wish;
  try {
    wish = await api.getWish(id);
  } catch {
    notFound();
  }

  const { items: replies } = await api.getWishReplies(id).catch(() => ({ items: [] }));

  const canModerate = session.user?.id === wish.author.id;

  async function replyAction(formData: FormData) {
    "use server";

    const headerStore = await headers();
    const clientIp = resolveClientIp(headerStore);
    const replySession = await getSession();
    const cookieHeader = replySession.user
      ? buildCookieHeader(replySession.sessionId, replySession.csrfToken)
      : undefined;

    try {
      await api.createWishReply(
        id,
        {
          body: String(formData.get("body") ?? ""),
          nickname: String(formData.get("nickname") ?? "") || null,
        },
        {
          cookieHeader,
          csrfToken: replySession.csrfToken,
          clientIp,
        },
      );
    } catch (err) {
      if (err instanceof ApiClientError) {
        redirect(`/wishes/${id}?replyError=${encodeURIComponent(err.message)}`);
      }
      throw err;
    }

    redirect(`/wishes/${id}`);
  }

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <CoverHero
          seed={wish.id}
          type="wish"
          title={wish.title}
          tags={wish.tags}
          coverUrl={wish.coverUrl}
        />
        <div className="detail-header">
          <StatusBadge status={wish.status} locale={locale} />
          <span className="meta-muted">{formatDate(wish.createdAt, locale)}</span>
        </div>
        <h1 className="sr-only">{wish.title}</h1>
        <p className="lead wish-detail-lead">{wish.description}</p>

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
            <LikeButton targetType="wish" targetId={wish.id} initialCount={wish.likeCount} />
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
          {(wish.deliverables ?? []).length === 0 ? (
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

        <WishReplies
          locale={locale}
          replies={replies}
          error={query.replyError}
          replyAction={replyAction}
        />
      </main>
    </>
  );
}