import Link from "next/link";
import { getSession } from "@/lib/session";
import { t, labels } from "@/lib/i18n";

export async function Nav() {
  const { user } = await getSession();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">VK</span>
          <span className="brand-text">
            VibeKing
            <small>{labels.platform.zh}</small>
          </span>
        </Link>
        <nav className="nav-links">
          <Link href="/wishes">{t(labels.nav.wishes)}</Link>
          <Link href="/docs">{t(labels.nav.docs)}</Link>
          {user ? (
            <>
              <Link href="/wishes/new" className="btn btn-ghost">
                {t(labels.nav.newWish)}
              </Link>
              <Link href="/dashboard" className="btn btn-primary">
                {t(labels.nav.dashboard)}
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              {t(labels.nav.login)}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}