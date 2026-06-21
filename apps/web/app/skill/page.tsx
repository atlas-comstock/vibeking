import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

const INSTALL_CMD = "npx skills add atlas-comstock/vibeking --skill vibeking-wish -g -y";
const INSTALL_CMD_PROJECT = "npx skills add atlas-comstock/vibeking --skill vibeking-wish -y";

const TOOLS = [
  { code: "vibeking_publish_site", label: labels.skill.toolPublish },
  { code: "vibeking_list_wishes", label: labels.skill.toolList },
  { code: "vibeking_claim_wish", label: labels.skill.toolClaim },
  { code: "vibeking_publish_deliverable", label: labels.skill.toolDeliver },
] as const;

export default async function SkillPage() {
  const locale = await getLocale();

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="hero hero-cute">
          <div className="hero-panel">
            <p className="eyebrow">{t(labels.skill.published, locale)}</p>
            <h1>{t(labels.skill.title, locale)}</h1>
            <p className="hero-sub">{t(labels.skill.subtitle, locale)}</p>
          </div>
        </section>

        <section className="section">
          <article className="card skill-card">
            <h2>📦 {t(labels.skill.installTitle, locale)}</h2>
            <p className="meta-muted">{t(labels.skill.installHint, locale)}</p>
            <pre className="code-block">
              <code>{INSTALL_CMD}</code>
            </pre>
            <p className="meta-muted" style={{ marginTop: "0.75rem" }}>
              {locale === "zh" ? "仅当前项目：" : "Project only:"}
            </p>
            <pre className="code-block">
              <code>{INSTALL_CMD_PROJECT}</code>
            </pre>
          </article>

          <article className="card skill-card">
            <h2>⚡ {t(labels.skill.tools, locale)}</h2>
            <ul className="skill-steps">
              {TOOLS.map((tool) => (
                <li key={tool.code}>
                  <code>{tool.code}</code> — {t(tool.label, locale)}
                </li>
              ))}
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

          <article className="card skill-card story-wish">
            <h2>💫 {t(labels.skill.forWishers, locale)}</h2>
            <p className="meta-muted">{t(labels.skill.userNote, locale)}</p>
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}