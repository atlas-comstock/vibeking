import Link from "next/link";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";
import { API_BASE_URL } from "@/lib/config";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

type Props = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const locale = await getLocale();
  const params = await searchParams;
  const redirect = params.redirect ?? "/dashboard";
  const githubUrl = `${API_BASE_URL}/auth/github?redirect=${encodeURIComponent(redirect)}`;

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="card login-card">
          <h1>{t(labels.login.title, locale)}</h1>
          <p className="meta-muted">{t(labels.login.subtitle, locale)}</p>
          {params.error && <p className="error-banner">Session error — please try again.</p>}
          <div className="login-actions">
            <a href={githubUrl} className="btn btn-primary btn-block">
              {t(labels.login.github, locale)}
            </a>
            <form action={`${API_BASE_URL}/auth/magic-link/request`} method="post">
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input"
                required
              />
              <button type="submit" className="btn btn-ghost btn-block">
                {t(labels.login.magicLink, locale)}
              </button>
            </form>
          </div>
          <p className="meta-muted">
            <Link href="/">← {t(labels.nav.discover, locale)}</Link>
          </p>
        </section>
      </main>
    </>
  );
}