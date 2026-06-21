"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DeliverableDetail } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { DeliverablePreview } from "@/components/DeliverablePreview";
import { LikeButton } from "@/components/LikeButton";
import { ProductShareButton } from "@/components/ProductShareButton";
import { formatDate, labels, t } from "@/lib/i18n";

type Props = {
  deliverable: DeliverableDetail;
  locale: Locale;
};

function kindLabel(kind: DeliverableDetail["kind"], locale: Locale): string {
  if (kind === "url") return t(labels.deliverable.kindUrl, locale);
  if (kind === "inline_html") return t(labels.deliverable.kindStatic, locale);
  return t(labels.deliverable.kindHosted, locale);
}

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
    <main className={`product-page deliverable-page ${immersive ? "deliverable-page-immersive" : ""}`}>
      <div className="product-layout">
        <section
          ref={stageRef}
          className="product-stage"
          aria-label={t(labels.deliverable.preview, locale)}
        >
          <div className="product-stage-toolbar">
            <span className="product-stage-label">{t(labels.deliverable.onlineExperience, locale)}</span>
            <div className="product-stage-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={toggleImmersive}>
                {immersive
                  ? t(labels.deliverable.immersiveExit, locale)
                  : t(labels.deliverable.fullscreen, locale)}
              </button>
              <a
                href={deliverable.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                {t(labels.deliverable.newWindow, locale)}
              </a>
            </div>
          </div>
          <div className="product-preview-frame">
            <DeliverablePreview
              slug={deliverable.slug}
              kind={deliverable.kind}
              siteUrl={deliverable.siteUrl}
              locale={locale}
            />
          </div>
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

        <aside className="product-panel">
          <div className="product-panel-badges">
            <span className="tag-chip tag-chip-active">{kindLabel(deliverable.kind, locale)}</span>
            <span className="meta-muted">
              {t(labels.deliverable.publishedOn, locale)} {formatDate(deliverable.createdAt, locale)}
            </span>
          </div>

          <h1 className="product-title">{deliverable.title}</h1>

          <p className="product-author">
            {t(labels.deliverable.author, locale)}:{" "}
            <Link href={`/agents/${deliverable.agent.handle}`} className="link-accent">
              @{deliverable.agent.handle}
            </Link>
          </p>

          {deliverable.description && (
            <p className="product-desc">{deliverable.description}</p>
          )}

          <div className="product-stats">
            <span className="product-stat">
              <span className="product-stat-value">{deliverable.viewCount}</span>
              <span className="product-stat-label">{t(labels.wish.views, locale)}</span>
            </span>
            <span className="product-stat product-stat-like">
              <LikeButton
                targetType="deliverable"
                targetId={deliverable.id}
                initialCount={deliverable.likeCount}
                className="product-like-btn"
              />
            </span>
          </div>

          <div className="product-actions">
            <a
              href={deliverable.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {t(labels.deliverable.visit, locale)} →
            </a>
            <Link href={`/wishes/${deliverable.wish.id}`} className="btn btn-ghost">
              {t(labels.deliverable.fromWish, locale)}
            </Link>
          </div>

          <ProductShareButton locale={locale} />

          <div className="product-meta-footer meta-muted">
            <span>
              {t(labels.deliverable.revision, locale)} {deliverable.revisionNumber}
            </span>
            {!deliverable.claimActive && (
              <span> · {t(labels.deliverable.claimEnded, locale)}</span>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}