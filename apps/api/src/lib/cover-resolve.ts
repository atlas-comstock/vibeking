import { googleFaviconUrl, originFaviconUrl, parseOgImage } from "./cover-html.js";

export type ResolvedCover = {
  coverUrl: string | null;
  faviconUrl: string | null;
};

export async function resolveSiteCover(siteUrl: string): Promise<ResolvedCover> {
  const googleFavicon = googleFaviconUrl(siteUrl, 256);
  const originFavicon = originFaviconUrl(siteUrl);
  let coverUrl: string | null = null;

  try {
    const res = await fetch(siteUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "VibeKingCoverBot/1.0",
      },
      signal: AbortSignal.timeout(4500),
      redirect: "follow",
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        const html = await res.text();
        const og = parseOgImage(html);
        if (og) {
          try {
            coverUrl = new URL(og, siteUrl).href;
          } catch {
            coverUrl = og;
          }
        }
      } else if (contentType.startsWith("image/")) {
        coverUrl = siteUrl;
      }
    }
  } catch {
    // fall through to favicon
  }

  return {
    coverUrl,
    faviconUrl: coverUrl ?? googleFavicon ?? originFavicon,
  };
}