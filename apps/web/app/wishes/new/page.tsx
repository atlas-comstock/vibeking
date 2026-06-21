import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
import { api, ApiClientError, buildCookieHeader } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getSession } from "@/lib/session";

function resolveClientIp(headerStore: Awaited<ReturnType<typeof headers>>) {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    undefined
  );
}

async function createWishAction(formData: FormData) {
  "use server";

  const headerStore = await headers();
  const clientIp = resolveClientIp(headerStore);
  const session = await getSession();
  const cookieHeader = session.user
    ? buildCookieHeader(session.sessionId, session.csrfToken)
    : undefined;

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const budgetRaw = String(formData.get("budgetCents") ?? "").trim();
  const budgetAmount = budgetRaw ? Number(budgetRaw) : null;
  const budgetCents =
    budgetAmount != null && !Number.isNaN(budgetAmount) ? budgetAmount * 100 : null;
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();

  let wish;
  try {
    wish = await api.createWish(
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        tags,
        budgetCents,
        budgetCurrency: String(formData.get("budgetCurrency") ?? "CNY"),
        coverUrl: String(formData.get("coverUrl") ?? "").trim() || null,
        deadline: deadlineRaw || null,
      },
      { cookieHeader, csrfToken: session.csrfToken, clientIp },
    );
  } catch (err) {
    if (err instanceof ApiClientError) {
      redirect(`/wishes/new?error=${encodeURIComponent(err.message)}`);
    }
    throw err;
  }

  redirect(`/wishes/${wish.id}`);
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewWishPage({ searchParams }: Props) {
  const locale = await getLocale();
  const params = await searchParams;

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="page-hero">
          <h1>{t(labels.wish.create, locale)}</h1>
          <p className="hero-sub">{t(labels.wish.createHint, locale)}</p>
          <p className="meta-muted">{t(labels.wish.rateLimitHint, locale)}</p>
        </section>
        {params.error && <p className="error-banner">{params.error}</p>}
        <form action={createWishAction} className="card form-stack">
          <label>
            {t(labels.wish.title, locale)}
            <input name="title" className="input" required />
          </label>
          <label>
            {t(labels.wish.description, locale)}
            <textarea name="description" className="input textarea" rows={6} required />
          </label>
          <label>
            {t(labels.wish.tags, locale)} (comma-separated)
            <input name="tags" className="input" placeholder="landing-page, web" />
          </label>
          <label>
            {t(labels.wish.coverUrl, locale)}
            <span className="field-hint">{t(labels.wish.coverUrlHint, locale)}</span>
            <input
              name="coverUrl"
              type="url"
              className="input"
              placeholder="https://..."
            />
          </label>
          <label>
            {t(labels.wish.budget, locale)}
            <span className="field-hint">{t(labels.wish.budgetHint, locale)}</span>
            <input
              name="budgetCents"
              type="number"
              className="input"
              min={0}
              step={1}
              placeholder={t(labels.wish.budgetPlaceholder, locale)}
            />
          </label>
          <input type="hidden" name="budgetCurrency" value="CNY" />
          <label>
            {t(labels.wish.deadline, locale)}
            <span className="field-hint">{t(labels.wish.deadlineHint, locale)}</span>
            <input name="deadline" type="date" className="input" />
          </label>
          <button type="submit" className="btn btn-primary">
            {t(labels.wish.create, locale)}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}