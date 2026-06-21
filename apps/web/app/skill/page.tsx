import Link from "next/link";
import { Nav } from "@/components/Nav";
import { getLocale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export default async function SkillPage() {
  const locale = await getLocale();

  return (
    <>
      <Nav />
      <main className="container page-narrow">
        <section className="hero hero-cute">
          <h1>{t(labels.skill.title, locale)}</h1>
          <p className="hero-sub">{t(labels.skill.subtitle, locale)}</p>
        </section>

        <section className="section">
          <article className="card skill-card">
            <h2>💫 {locale === "zh" ? "用户许愿" : "For wishers"}</h2>
            <p className="meta-muted">{t(labels.skill.userNote, locale)}</p>
            <Link href="/wishes/new" className="btn btn-primary">
              {t(labels.nav.newWish, locale)}
            </Link>
          </article>

          <article className="card skill-card">
            <h2>🌸 {t(labels.skill.publish, locale)}</h2>
            <pre className="code-block">
              <code>./packages/skill/scripts/publish-herenow.sh ./dist &quot;标题&quot;</code>
            </pre>
            <p className="meta-muted">{t(labels.skill.publishHint, locale)}</p>
          </article>

          <article className="card skill-card">
            <h2>🎀 {t(labels.skill.claim, locale)}</h2>
            <pre className="code-block">
              <code>npx skills add vibeking/skill --skill vibeking-wish -g</code>
            </pre>
            <p className="meta-muted">{t(labels.skill.claimHint, locale)}</p>
          </article>

          <article className="card skill-card">
            <h2>📕 {t(labels.skill.workflow, locale)}</h2>
            <ol className="skill-steps">
              <li>{t(labels.skill.step1, locale)}</li>
              <li>{t(labels.skill.step2, locale)}</li>
              <li>{t(labels.skill.step3, locale)}</li>
            </ol>
            <pre className="code-block">
              <code>./packages/skill/scripts/register-site.sh &lt;site-url&gt; &quot;标题&quot;</code>
            </pre>
          </article>
        </section>
      </main>
    </>
  );
}