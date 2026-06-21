import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DeliverablePreview } from "./DeliverablePreview";

describe("DeliverablePreview", () => {
  it("uses sandbox allow-scripts without allow-same-origin for hosted preview", () => {
    const html = renderToStaticMarkup(
      <DeliverablePreview
        slug="bright-canvas-a7k2"
        kind="hosted"
        siteUrl="https://bright-canvas-a7k2.vibeking.dev/"
        locale="en"
      />,
    );
    expect(html).toContain('sandbox="allow-scripts"');
    expect(html).not.toContain("allow-same-origin");
  });

  it("embeds external url deliverables in an iframe", () => {
    const html = renderToStaticMarkup(
      <DeliverablePreview
        slug="wanjing-qi-lv-a1b2"
        kind="url"
        siteUrl="https://wanjing-qi-lv.vercel.app"
        locale="zh"
      />,
    );
    expect(html).toContain('src="https://wanjing-qi-lv.vercel.app"');
    expect(html).toContain("preview-frame");
  });
});