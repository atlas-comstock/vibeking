import {
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { PublishFileDescriptor, PresignedUpload } from "./types.js";
import { storageKey } from "./slug.js";

export const PRESIGN_EXPIRES_SECONDS = 3600;

export async function createPresignedUploads(
  s3: S3Client,
  bucket: string,
  slug: string,
  versionId: string,
  files: PublishFileDescriptor[],
): Promise<{ uploads: PresignedUpload[]; skipped: string[] }> {
  const uploads: PresignedUpload[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const key = storageKey(slug, versionId, file.path);
    if (file.hash) {
      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket: bucket, Key: key }),
        );
        const etag = head.ETag?.replace(/"/g, "");
        if (etag && etag.startsWith(file.hash.slice(0, 32))) {
          skipped.push(file.path);
          continue;
        }
      } catch {
        // object missing — presign upload
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: file.contentType,
      ContentLength: file.size,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    });

    uploads.push({
      path: file.path,
      method: "PUT",
      url,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": String(file.size),
      },
    });
  }

  return { uploads, skipped };
}

export async function putInlineHtml(
  s3: S3Client,
  bucket: string,
  slug: string,
  versionId: string,
  html: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey(slug, versionId, "index.html"),
      Body: html,
      ContentType: "text/html; charset=utf-8",
    }),
  );
}