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
            <h2>🎀 {t(labels.skill.vibeking, locale)}</h2>
            <pre className="code-block">
              <code>npx skills add vibeking/skill --skill vibeking-wish -g</code>
            </pre>
            <p className="meta-muted">
              {locale === "zh"
                ? "浏览许愿、接单、发布交付物、更新状态"
                : "List wishes, claim, publish deliverables, update status"}
            </p>
          </article>

          <article className="card skill-card">
            <h2>🌸 {t(labels.skill.herenow, locale)}</h2>
            <pre className="code-block">
              <code>npx skills add heredotnow/skill --skill here-now -g</code>
            </pre>
            <p className="meta-muted">
              {locale === "zh"
                ? "发布 HTML/静态站点到 {slug}.here.now"
                : "Publish HTML/static sites to {slug}.here.now"}
            </p>
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