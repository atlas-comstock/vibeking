import type { SlugMeta } from "./types.js";

export type { SlugMeta };

const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
};

export function guessContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export function resolveObjectKey(
  slug: string,
  versionId: string,
  pathname: string,
  _spaMode: boolean,
): { key: string; contentType: string } {
  const clean = pathname.replace(/^\/+/, "") || "index.html";
  const key = `sites/${slug}/v/${versionId}/${clean}`;
  return { key, contentType: guessContentType(clean) };
}

export function spaFallbackKey(slug: string, versionId: string): string {
  return `sites/${slug}/v/${versionId}/index.html`;
}

export function cacheControlForPath(path: string): string {
  if (path.endsWith("meta.json") || path.endsWith(".html")) {
    return "no-cache";
  }
  return "public, max-age=60, s-maxage=3600";
}

export function securityHeaders(contentType: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

export function parseSlugFromHost(hostname: string, baseDomain: string): string | null {
  if (hostname === `preview.${baseDomain}`) return null;
  const suffix = `.${baseDomain}`;
  if (!hostname.endsWith(suffix)) return null;
  const slug = hostname.slice(0, -suffix.length);
  if (!slug || slug.includes(".")) return null;
  return slug;
}

export type R2Bucket = {
  get(key: string): Promise<{
    body: ReadableStream | null;
    httpMetadata?: { contentType?: string };
  } | null>;
};

export type KvNamespace = {
  get(key: string): Promise<string | null>;
};

export async function resolveVersionId(
  slug: string,
  kv: KvNamespace | null,
  r2: R2Bucket,
  metaKeyFn: (s: string) => string,
): Promise<SlugMeta | null> {
  if (kv) {
    const cached = await kv.get(`slug:${slug}`);
    if (cached) {
      try {
        return JSON.parse(cached) as SlugMeta;
      } catch {
        /* fall through */
      }
    }
  }

  const metaObj = await r2.get(metaKeyFn(slug));
  if (!metaObj?.body) return null;

  const text = await new Response(metaObj.body).text();
  try {
    return JSON.parse(text) as SlugMeta;
  } catch {
    return null;
  }
}