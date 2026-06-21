import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export async function SiteFooter() {
  const locale = await getLocale();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span className="footer-mark">✿</span>
        <span className="footer-text">VibeKing</span>
        <span className="footer-dot">·</span>
        <span className="footer-tagline">{t(labels.footer.tagline, locale)}</span>
      </div>
    </footer>
  );
}