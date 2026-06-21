import { NextResponse } from "next/server";
import { googleFaviconUrl, originFaviconUrl, parseOgImage } from "@/lib/cover";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "url required" } },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "invalid url" } },
      { status: 400 },
    );
  }

  const googleFavicon = googleFaviconUrl(parsed.href, 256);
  const originFavicon = originFaviconUrl(parsed.href);
  let imageUrl: string | null = null;

  try {
    const res = await fetch(parsed.href, {
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
            imageUrl = new URL(og, parsed.href).href;
          } catch {
            imageUrl = og;
          }
        }
      } else if (contentType.startsWith("image/")) {
        imageUrl = parsed.href;
      }
    }
  } catch {
    // fall back to favicon
  }

  return NextResponse.json({
    imageUrl,
    faviconUrl: originFavicon,
    googleFavicon,
    previewUrl: imageUrl ?? googleFavicon ?? originFavicon,
  });
}