"use client";

import { useState } from "react";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

export function ProductShareButton({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="product-share">
      <h2 className="product-panel-heading">{t(labels.deliverable.shareWork, locale)}</h2>
      <p className="meta-muted product-share-hint">
        {t(labels.deliverable.shareHint, locale)}
      </p>
      <button type="button" className="btn btn-ghost product-share-btn" onClick={copyLink}>
        {copied ? t(labels.deliverable.copied, locale) : t(labels.deliverable.copyShareLink, locale)}
      </button>
    </div>
  );
}