import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

const STEPS = [
  {
    emoji: "💫",
    title: labels.home.storyWish.title,
    desc: labels.home.storyWish.desc,
    href: "/wishes/new",
    cta: labels.nav.newWish,
    tone: "story-wish",
  },
  {
    emoji: "🧁",
    title: labels.home.storyDiscover.title,
    desc: labels.home.storyDiscover.desc,
    href: "/",
    cta: labels.nav.discover,
    tone: "story-discover",
  },
  {
    emoji: "🌸",
    title: labels.home.storyAgent.title,
    desc: labels.home.storyAgent.desc,
    href: "/skill",
    cta: labels.nav.skill,
    tone: "story-agent",
  },
] as const;

export function ProductStory({ locale }: { locale: Locale }) {
  return (
    <section className="section story-section">
      <h2 className="story-heading">{t(labels.home.storyTitle, locale)}</h2>
      <div className="story-grid">
        {STEPS.map((step, i) => (
          <article key={step.tone} className={`story-card ${step.tone}`} style={{ animationDelay: `${i * 80}ms` }}>
            <span className="story-emoji">{step.emoji}</span>
            <h3>{t(step.title, locale)}</h3>
            <p>{t(step.desc, locale)}</p>
            <Link href={step.href} className="story-link">
              {t(step.cta, locale)} →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}