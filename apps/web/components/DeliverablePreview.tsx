import React from "react";
import type { DeliverableKind } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { PREVIEW_ORIGIN } from "@/lib/config";
import { labels, t } from "@/lib/i18n";

type Props = {
  slug: string;
  kind: DeliverableKind;
  siteUrl: string;
  inlineHtml?: string;
  locale: Locale;
};

export function DeliverablePreview({ slug, kind, siteUrl, inlineHtml, locale }: Props) {
  if (kind === "inline_html" && inlineHtml) {
    return (
      <div className="preview-frame-wrap preview-frame-wrap-large">
        <iframe
          title={`preview-${slug}`}
          sandbox="allow-scripts"
          srcDoc={inlineHtml}
          className="preview-frame preview-frame-large"
        />
      </div>
    );
  }

  if (kind === "url") {
    return (
      <div className="preview-url-wrap">
        <div className="preview-frame-wrap preview-frame-wrap-large">
          <iframe
            title={`preview-${slug}`}
            src={siteUrl}
            className="preview-frame preview-frame-large"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="preview-url-fallback meta-muted">
          {t(labels.deliverable.previewFallback, locale)}{" "}
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="link-accent">
            {t(labels.deliverable.visit, locale)} →
          </a>
        </p>
      </div>
    );
  }

  const embedUrl =
    process.env.NODE_ENV === "development"
      ? siteUrl
      : `${PREVIEW_ORIGIN}/embed/${slug}`;

  return (
    <div className="preview-frame-wrap preview-frame-wrap-large">
      <iframe
        title={`preview-${slug}`}
        src={embedUrl}
        sandbox="allow-scripts"
        className="preview-frame preview-frame-large"
        loading="lazy"
      />
    </div>
  );
}