import Link from "next/link";
import { getSession } from "@/lib/session";
import { getLocale } from "@/lib/locale";
import { t, labels } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Nav() {
  const [{ user }, locale] = await Promise.all([getSession(), getLocale()]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">✿</span>
          <span className="brand-text">
            VibeKing
            <small>{t(labels.platformSub, locale)}</small>
          </span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">
            {t(labels.nav.discover, locale)}
          </Link>
          <Link href="/wishes" className="nav-link">
            {t(labels.nav.wishes, locale)}
          </Link>
          <Link href="/skill" className="nav-link">
            {t(labels.nav.skill, locale)}
          </Link>
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link href="/wishes/new" className="btn btn-ghost">
                {t(labels.nav.newWish, locale)}
              </Link>
              <Link href="/dashboard" className="btn btn-primary">
                {t(labels.nav.dashboard, locale)}
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              {t(labels.nav.login, locale)}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}