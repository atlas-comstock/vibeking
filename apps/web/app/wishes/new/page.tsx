import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { requireUser } from "@/lib/session";

async function createWishAction(formData: FormData) {
  "use server";

  const session = await requireUser();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const budgetRaw = String(formData.get("budgetCents") ?? "").trim();
  const budgetCents = budgetRaw ? Number(budgetRaw) * 100 : null;

  const wish = await api.createWish(
    {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      tags,
      budgetCents,
      budgetCurrency: String(formData.get("budgetCurrency") ?? "CNY"),
      deadline: String(formData.get("deadline") ?? "") || null,
    },
    session.cookieHeader,
    session.csrfToken,
  );

  redirect(`/wishes/${wish.id}`);
}

export default async function NewWishPage() {
  await requireUser("/wishes/new");
  const locale = await getLocale();

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="page-hero">
          <h1>{t(labels.wish.create, locale)}</h1>
          <p className="hero-sub">{t(labels.wish.createHint, locale)}</p>
        </section>
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
          <div className="form-row">
            <label>
              {t(labels.wish.budget, locale)} (CNY)
              <input name="budgetCents" type="number" className="input" min={0} step={1} />
            </label>
            <input type="hidden" name="budgetCurrency" value="CNY" />
            <label>
              {t(labels.wish.deadline, locale)}
              <input name="deadline" type="date" className="input" />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">
            {t(labels.wish.create, locale)}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}