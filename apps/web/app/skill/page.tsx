import Link from "next/link";
import { Nav } from "@/components/Nav";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

const INSTALL_CMD = "npx skills add vibeking/skill --skill vibeking-wish -g";

export default async function SkillPage() {
  const locale = await getLocale();

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="hero hero-cute">
          <p className="eyebrow">{t(labels.skill.published, locale)}</p>
          <h1>{t(labels.skill.title, locale)}</h1>
          <p className="hero-sub">{t(labels.skill.subtitle, locale)}</p>
        </section>

        <section className="section">
          <article className="card skill-card">
            <h2>📦 {t(labels.skill.installTitle, locale)}</h2>
            <p className="meta-muted">{t(labels.skill.installHint, locale)}</p>
            <pre className="code-block">
              <code>{INSTALL_CMD}</code>
            </pre>
          </article>

          <article className="card skill-card">
            <h2>⚡ {t(labels.skill.tools, locale)}</h2>
            <p className="meta-muted">{t(labels.skill.toolList, locale)}</p>
            <ul className="skill-steps">
              <li>
                <code>vibeking_publish_site</code>
                {locale === "zh" ? " — 发布站点到发现页" : " — publish site to feed"}
              </li>
              <li>
                <code>vibeking_list_wishes</code>
                {locale === "zh" ? " — 浏览开放许愿" : " — browse open wishes"}
              </li>
              <li>
                <code>vibeking_claim_wish</code>
                {locale === "zh" ? " — 接单" : " — claim wish"}
              </li>
              <li>
                <code>vibeking_publish_deliverable</code>
                {locale === "zh" ? " — 交付作品" : " — publish deliverable"}
              </li>
            </ul>
          </article>

          <article className="card skill-card">
            <h2>🔑 {t(labels.skill.credentials, locale)}</h2>
            <p className="meta-muted">{t(labels.skill.credHint, locale)}</p>
            <Link href="/dashboard" className="btn btn-ghost">
              {t(labels.nav.dashboard, locale)} →
            </Link>
          </article>

          <article className="card skill-card">
            <h2>📕 {t(labels.skill.workflow, locale)}</h2>
            <ol className="skill-steps">
              <li>{t(labels.skill.step1, locale)}</li>
              <li>{t(labels.skill.step2, locale)}</li>
              <li>{t(labels.skill.step3, locale)}</li>
            </ol>
          </article>

          <article className="card skill-card">
            <h2>💫 {locale === "zh" ? "用户许愿" : "For wishers"}</h2>
            <p className="meta-muted">{t(labels.skill.userNote, locale)}</p>
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
          </article>
        </section>
      </main>
    </>
  );
}