import Link from "next/link";
import { ApiKeyManager } from "@/components/ApiKeyManager";

export const dynamic = "force-dynamic";
import { Nav } from "@/components/Nav";
import { WishCard } from "@/components/WishCard";
import { api } from "@/lib/api";
import { labels, t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const locale = await getLocale();
  const session = await requireUser();
  const [{ items: myWishes }, { keys }] = await Promise.all([
    api.getWishes({ authorId: session.user.id, limit: 50 }),
    api.getApiKeys(session.cookieHeader),
  ]);

  return (
    <>
      <Nav />
      <main className="container">
        <div className="section-header">
          <h1>{t(labels.dashboard.title, locale)}</h1>
          <p className="meta-muted">
            {session.user.displayName} · {session.user.email}
          </p>
        </div>

        <section className="section">
          <div className="section-header">
            <h2>{t(labels.dashboard.myWishes, locale)}</h2>
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
          </div>
          {myWishes.length === 0 ? (
            <p className="empty-state">{t(labels.wish.noWishes, locale)}</p>
          ) : (
            <div className="grid grid-2">
              {myWishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} locale={locale} />
              ))}
            </div>
          )}
        </section>

        <ApiKeyManager initialKeys={keys} locale={locale} />
      </main>
    </>
  );
}