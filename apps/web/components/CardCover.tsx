"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CoverItemType } from "@/lib/cover";
import { getCoverVisual, googleFaviconUrl } from "@/lib/cover";

type Props = {
  href: string;
  seed: string;
  type: CoverItemType;
  siteUrl?: string;
  coverEmoji?: string;
  rank?: number;
  className?: string;
};

export function CardCover({
  href,
  seed,
  type,
  siteUrl,
  coverEmoji,
  rank,
  className,
}: Props) {
  const visual = useMemo(
    () => getCoverVisual(seed, type, coverEmoji),
    [seed, type, coverEmoji],
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"og" | "favicon" | "emoji">("emoji");

  useEffect(() => {
    if (!siteUrl) {
      setPreviewUrl(null);
      setMode("emoji");
      return;
    }

    let cancelled = false;
    const fallbackFavicon = googleFaviconUrl(siteUrl, 128);

    fetch(`/api/cover?url=${encodeURIComponent(siteUrl)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { imageUrl?: string | null; previewUrl?: string | null } | null) => {
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
        }
      })
      .catch(() => {
        if (!cancelled && fallbackFavicon) {
          setPreviewUrl(fallbackFavicon);
          setMode("favicon");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [siteUrl]);

  const coverClass = [
    "pin-cover",
    `pin-cover-type-${type}`,
    `pin-cover-pattern-${visual.pattern}`,
    mode !== "emoji" ? "pin-cover-has-media" : "",
    mode === "og" ? "pin-cover-has-og" : "",
    mode === "favicon" ? "pin-cover-has-favicon" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
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
    </>
  );

  const style = { background: visual.gradient };

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={coverClass}
        style={style}
        target="_blank"
        rel="noreferrer"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={coverClass} style={style}>
      {inner}
    </Link>
  );
}