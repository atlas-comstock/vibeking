import { metaJsonKey } from "@vibeking/publish";
import {
  cacheControlForPath,
  parseSlugFromHost,
  resolveObjectKey,
  resolveVersionId,
  securityHeaders,
  spaFallbackKey,
  type KvNamespace,
  type R2Bucket,
  type SlugMeta,
} from "@vibeking/publish/serving";

export type { SlugMeta, R2Bucket, KvNamespace };

const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'";

export async function serveStaticRequest(
  request: Request,
  env: { R2: R2Bucket; SLUG_META?: KvNamespace; SITE_BASE_DOMAIN?: string },
): Promise<Response> {
  const url = new URL(request.url);
  const baseDomain = env.SITE_BASE_DOMAIN ?? "vibeking.dev";

  if (url.hostname.startsWith("preview.")) {
    const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);
    if (embedMatch) {
      const slug = embedMatch[1]!;
      const target = `https://${slug}.${baseDomain}/`;
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"></head><body style="margin:0"><iframe src="${target}" sandbox="allow-scripts" style="width:100%;height:100vh;border:0" title="preview"></iframe></body></html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": CSP },
      });
    }
  }

  const slug = parseSlugFromHost(url.hostname, baseDomain);
  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const meta = await resolveVersionId(slug, env.SLUG_META ?? null, env.R2, metaJsonKey);
  if (!meta?.currentVersionId) {
    return new Response("Site not found", { status: 404 });
  }

  const pathname = url.pathname;
  const { key, contentType } = resolveObjectKey(
    slug,
    meta.currentVersionId,
    pathname,
    !!meta.spaMode,
  );
  let obj = await env.R2.get(key);

  if (!obj?.body && meta.spaMode) {
    obj = await env.R2.get(spaFallbackKey(slug, meta.currentVersionId));
    if (obj?.body) {
      const headers = {
        ...securityHeaders("text/html; charset=utf-8"),
        "Cache-Control": cacheControlForPath("index.html"),
      };
      return new Response(obj.body, { headers });
    }
  }

  if (!obj?.body) {
    return new Response("Not found", { status: 404 });
  }

  const resolvedType = obj.httpMetadata?.contentType ?? contentType;
  const headers = {
    ...securityHeaders(resolvedType),
    "Cache-Control": cacheControlForPath(pathname),
  };
  return new Response(obj.body, { headers });
}