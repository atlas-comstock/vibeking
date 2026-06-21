import React from "react";
import type { DeliverableKind } from "@vibeking/shared";
import { PREVIEW_ORIGIN } from "@/lib/config";
import { labels, t } from "@/lib/i18n";

type Props = {
  slug: string;
  kind: DeliverableKind;
  siteUrl: string;
  inlineHtml?: string;
};

export function DeliverablePreview({ slug, kind, siteUrl, inlineHtml }: Props) {
  if (kind === "inline_html" && inlineHtml) {
    return (
      <div className="preview-frame-wrap">
        <iframe
          title={`preview-${slug}`}
          sandbox="allow-scripts"
          srcDoc={inlineHtml}
          className="preview-frame"
        />
      </div>
    );
  }

  if (kind === "url") {
    return (
      <div className="preview-external card">
        <p>{t(labels.deliverable.visit)}</p>
        <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          {siteUrl}
        </a>
      </div>
    );
  }

  const embedUrl =
    process.env.NODE_ENV === "development"
      ? siteUrl
      : `${PREVIEW_ORIGIN}/embed/${slug}`;

  return (
    <div className="preview-frame-wrap">
      <iframe
        title={`preview-${slug}`}
        src={embedUrl}
        sandbox="allow-scripts"
        className="preview-frame"
        loading="lazy"
      />
    </div>
  );
}