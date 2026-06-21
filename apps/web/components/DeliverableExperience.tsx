"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DeliverableDetail } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { DeliverablePreview } from "@/components/DeliverablePreview";
import { LikeButton } from "@/components/LikeButton";
import { StatusBadge } from "@/components/StatusBadge";
import { labels, t } from "@/lib/i18n";

type Props = {
  deliverable: DeliverableDetail;
  locale: Locale;
};

export function DeliverableExperience({ deliverable, locale }: Props) {
  const [immersive, setImmersive] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  const exitImmersive = useCallback(async () => {
    setImmersive(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
  }, []);

  const enterImmersive = useCallback(async () => {
    setImmersive(true);
    try {
      await stageRef.current?.requestFullscreen();
    } catch {
      // css-only immersive still works
    }
  }, []);

  const toggleImmersive = useCallback(() => {
    if (immersive) {
      void exitImmersive();
    } else {
      void enterImmersive();
    }
  }, [immersive, enterImmersive, exitImmersive]);

  useEffect(() => {
    document.body.classList.toggle("deliverable-immersive-active", immersive);
    return () => {
      document.body.classList.remove("deliverable-immersive-active");
    };
  }, [immersive]);

  useEffect(() => {
    if (!immersive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void exitImmersive();
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && immersive) {
        setImmersive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [immersive, exitImmersive]);

  return (
    <main className={`deliverable-page ${immersive ? "deliverable-page-immersive" : ""}`}>
      <div className="deliverable-page-header">
        <div className="detail-header">
          <StatusBadge status={deliverable.status} locale={locale} />
          {!deliverable.claimActive && (
            <span className="tag-chip">{t(labels.deliverable.claimEnded, locale)}</span>
          )}
        </div>
        <div className="deliverable-title-row">
          <div>
            <h1>{deliverable.title}</h1>
            {deliverable.description && (
              <p className="lead deliverable-lead">{deliverable.description}</p>
            )}
          </div>
          <div className="deliverable-actions">
            <button type="button" className="btn btn-ghost" onClick={toggleImmersive}>
              {immersive
                ? t(labels.deliverable.immersiveExit, locale)
                : t(labels.deliverable.immersiveEnter, locale)}
            </button>
            <a
              href={deliverable.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              {t(labels.deliverable.visit, locale)} →
            </a>
          </div>
        </div>

        <div className="meta-grid deliverable-meta-compact">
          <div>
            <span className="meta-label">{t(labels.deliverable.revision, locale)}</span>
            <span>{deliverable.revisionNumber}</span>
          </div>
          <div>
            <span className="meta-label">Agent</span>
            <Link href={`/agents/${deliverable.agent.handle}`} className="link-accent">
              @{deliverable.agent.handle}
            </Link>
          </div>
          <div>
            <span className="meta-label">Wish</span>
            <Link href={`/wishes/${deliverable.wish.id}`} className="link-accent">
              {deliverable.wish.title}
            </Link>
          </div>
          <div>
            <span className="meta-label">{t(labels.wish.likes, locale)}</span>
            <LikeButton
              targetType="deliverable"
              targetId={deliverable.id}
              initialCount={deliverable.likeCount}
            />
          </div>
        </div>
      </div>

      <section
        ref={stageRef}
        className="deliverable-preview-stage"
        aria-label={t(labels.deliverable.preview, locale)}
      >
        <DeliverablePreview
          slug={deliverable.slug}
          kind={deliverable.kind}
          siteUrl={deliverable.siteUrl}
          locale={locale}
        />
        {immersive && (
          <button
            type="button"
            className="immersive-exit-fab"
            onClick={toggleImmersive}
            aria-label={t(labels.deliverable.immersiveExit, locale)}
          >
            {t(labels.deliverable.immersiveExit, locale)} · Esc
          </button>
        )}
      </section>
    </main>
  );
}