import {
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import type { PublishFileDescriptor, SlugMeta, FinalizeResult } from "./types.js";
import { buildSiteUrl, metaJsonKey, storageKey } from "./slug.js";
import { syncSlugToKv } from "./kv-sync.js";

export async function verifyUploadsComplete(
  s3: S3Client,
  bucket: string,
  slug: string,
  versionId: string,
  files: PublishFileDescriptor[],
): Promise<string[]> {
  const missing: string[] = [];
  for (const file of files) {
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: storageKey(slug, versionId, file.path),
        }),
      );
    } catch {
      missing.push(file.path);
    }
  }
  return missing;
}

export async function writeMetaJson(
  s3: S3Client,
  bucket: string,
  slug: string,
  meta: SlugMeta,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: metaJsonKey(slug),
      Body: JSON.stringify(meta),
      ContentType: "application/json",
      CacheControl: "no-cache",
    }),
  );
}

export async function finalizeHostedVersion(input: {
  s3: S3Client;
  bucket: string;
  slug: string;
  versionId: string;
  files: PublishFileDescriptor[];
  spaMode: boolean;
  revisionNumber: number;
  alreadyFinalized?: boolean;
  siteBaseDomain?: string;
}): Promise<FinalizeResult> {
  if (input.alreadyFinalized) {
    return {
      success: true,
      siteUrl: buildSiteUrl(input.slug, input.siteBaseDomain),
      revisionNumber: input.revisionNumber,
      alreadyFinalized: true,
    };
  }

  const missing = await verifyUploadsComplete(
    input.s3,
    input.bucket,
    input.slug,
    input.versionId,
    input.files,
  );

  if (missing.length > 0) {
    const err = new Error(`Missing files: ${missing.join(", ")}`);
    (err as Error & { code: string }).code = "UPLOAD_INCOMPLETE";
    throw err;
  }

  const nextRevision = input.revisionNumber === 0 ? 1 : input.revisionNumber + 1;
  const meta: SlugMeta = {
    currentVersionId: input.versionId,
    spaMode: input.spaMode,
    updatedAt: new Date().toISOString(),
  };

  await writeMetaJson(input.s3, input.bucket, input.slug, meta);
  await syncSlugToKv(input.slug, meta);

  return {
    success: true,
    siteUrl: buildSiteUrl(input.slug, input.siteBaseDomain),
    revisionNumber: nextRevision,
  };
}