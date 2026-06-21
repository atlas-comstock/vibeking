import { Hono } from "hono";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {
  cacheControlForPath,
  metaJsonKey,
  resolveObjectKey,
  securityHeaders,
  spaFallbackKey,
  type SlugMeta,
} from "@vibeking/publish";
import { config } from "../../config.js";
import { getS3Client } from "../../lib/s3.js";
import type { AppEnv } from "../../middleware/auth.js";

export const sitesProxyRoutes = new Hono<AppEnv>();

async function getObject(key: string) {
  const s3 = getS3Client();
  try {
    return await s3.send(
      new GetObjectCommand({ Bucket: config.s3.bucket, Key: key }),
    );
  } catch {
    return null;
  }
}

sitesProxyRoutes.get("/:slug/*", async (c) => {
  const slug = c.req.param("slug");
  const subpath = c.req.path.replace(`/sites/${slug}`, "") || "/";

  const metaRes = await getObject(metaJsonKey(slug));
  const metaText = await metaRes?.Body?.transformToString();
  if (!metaText) return c.text("Site not found", 404);

  const meta = JSON.parse(metaText) as SlugMeta;
  if (!meta.currentVersionId) return c.text("Site not found", 404);

  const pathname = subpath.startsWith("/") ? subpath : `/${subpath}`;
  const { key, contentType } = resolveObjectKey(
    slug,
    meta.currentVersionId,
    pathname,
    !!meta.spaMode,
  );

  let obj = await getObject(key);
  let resolvedType = contentType;

  if (!obj?.Body && meta.spaMode) {
    obj = await getObject(spaFallbackKey(slug, meta.currentVersionId));
    resolvedType = "text/html; charset=utf-8";
  }

  if (!obj?.Body) return c.text("Not found", 404);

  const body = await obj.Body.transformToByteArray();
  const headers = {
    ...securityHeaders(resolvedType),
    "Cache-Control": cacheControlForPath(pathname),
  };
  return new Response(body, { headers });
});

sitesProxyRoutes.get("/:slug", (c) => {
  const slug = c.req.param("slug");
  return c.redirect(`/sites/${slug}/`, 302);
});