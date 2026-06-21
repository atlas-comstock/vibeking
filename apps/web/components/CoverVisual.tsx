"use client";

import { useEffect, useMemo, useState } from "react";
import type { CoverItemType } from "@/lib/cover";
import { buildPosterCoverUrl, getCoverVisual, googleFaviconUrl } from "@/lib/cover";

export type CoverVisualProps = {
  seed: string;
  type: CoverItemType;
  title?: string;
  tags?: string[];
  siteUrl?: string;
  coverUrl?: string | null;
  coverEmoji?: string;
  rank?: number;
  variant?: "card" | "hero";
  className?: string;
};

export function CoverVisual({
  seed,
  type,
  title,
  tags,
  siteUrl,
  coverUrl,
  coverEmoji,
  rank,
  variant = "card",
  className,
}: CoverVisualProps) {
  const visual = useMemo(
    () => getCoverVisual(seed, type, coverEmoji),
    [seed, type, coverEmoji],
  );
  const posterUrl = useMemo(
    () =>
      buildPosterCoverUrl({
        type,
        seed,
        title,
        tags,
        coverEmoji: visual.emoji,
      }),
    [type, seed, title, tags, visual.emoji],
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"og" | "favicon" | "poster">("poster");

  useEffect(() => {
    if (coverUrl) {
      setPreviewUrl(coverUrl);
      setMode("og");
      return;
    }

    if (type === "wish") {
      setPreviewUrl(posterUrl);
      setMode("og");
      return;
    }

    if (!siteUrl) {
      setPreviewUrl(posterUrl);
      setMode("og");
      return;
    }

    let cancelled = false;
    const fallbackFavicon = googleFaviconUrl(siteUrl, 256);

    fetch(`/api/cover?url=${encodeURIComponent(siteUrl)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: { imageUrl?: string | null; previewUrl?: string | null } | null) => {
          if (cancelled) return;
          if (data?.imageUrl) {
            setPreviewUrl(data.imageUrl);
            setMode("og");
            return;
          }
          if (data?.previewUrl) {
            setPreviewUrl(data.previewUrl);
            setMode("favicon");
            return;
          }
          if (fallbackFavicon) {
            setPreviewUrl(fallbackFavicon);
            setMode("favicon");
            return;
          }
          setPreviewUrl(posterUrl);
          setMode("og");
        },
      )
      .catch(() => {
        if (!cancelled) {
          setPreviewUrl(fallbackFavicon ?? posterUrl);
          setMode(fallbackFavicon ? "favicon" : "og");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coverUrl, type, siteUrl, posterUrl]);

  const coverClass = [
    variant === "hero" ? "cover-hero" : "pin-cover",
    `pin-cover-type-${type}`,
    `pin-cover-pattern-${visual.pattern}`,
    previewUrl ? "pin-cover-has-media" : "",
    mode === "og" ? "pin-cover-has-og" : "",
    mode === "favicon" ? "pin-cover-has-favicon" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={coverClass} style={{ background: visual.gradient }}>
      {rank != null && <span className="pin-rank">{rank}</span>}
      {previewUrl && mode === "og" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="pin-cover-photo" loading="lazy" />
      )}
      {previewUrl && mode === "favicon" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="pin-cover-favicon" loading="lazy" />
      )}
      <span className="pin-emoji" aria-hidden>
        {visual.emoji}
      </span>
    </div>
  );
}