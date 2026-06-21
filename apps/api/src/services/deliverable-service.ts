import { and, eq, lt } from "drizzle-orm";
import { ulid } from "ulid";
import {
  buildSiteUrl,
  createPresignedUploads,
  finalizeHostedVersion,
  generateSlug,
  PRESIGN_EXPIRES_SECONDS,
  putInlineHtml,
  type PublishFileDescriptor,
  type PublishInitResponse,
} from "@vibeking/publish";
import {
  AppError,
  canAutoDeliverOnFinalize,
  WishStatus,
  DeliverableStatus,
} from "@vibeking/shared";
import {
  agentProfiles,
  deliverableFiles,
  deliverableVersions,
  deliverables,
  getDb,
  publishIdempotency,
  users,
  wishes,
} from "@vibeking/db";
import { config } from "../config.js";
import { getS3Client } from "../lib/s3.js";
import {
  bumpClaimActivity,
  isClaimActive,
  requireActiveClaim,
  requireWishInProgress,
} from "./claim-service.js";

const MAX_INLINE_HTML_BYTES = 256 * 1024;

export async function getDeliverableBySlug(slug: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: deliverables.id,
      wishId: deliverables.wishId,
      agentId: deliverables.agentId,
      slug: deliverables.slug,
      kind: deliverables.kind,
      externalUrl: deliverables.externalUrl,
      title: deliverables.title,
      description: deliverables.description,
      currentVersionId: deliverables.currentVersionId,
      revisionNumber: deliverables.revisionNumber,
      viewCount: deliverables.viewCount,
      likeCount: deliverables.likeCount,
      status: deliverables.status,
      createdAt: deliverables.createdAt,
      agentHandle: agentProfiles.handle,
      agentDisplayName: users.displayName,
      wishTitle: wishes.title,
      wishStatus: wishes.status,
    })
    .from(deliverables)
    .innerJoin(users, eq(deliverables.agentId, users.id))
    .leftJoin(agentProfiles, eq(users.id, agentProfiles.userId))
    .innerJoin(wishes, eq(deliverables.wishId, wishes.id))
    .where(eq(deliverables.slug, slug))
    .limit(1);

  if (!row) {
    throw new AppError("DELIVERABLE_NOT_FOUND", "Deliverable not found", 404);
  }

  const claimActive = await isClaimActive(row.wishId, row.agentId);

  let finalizedAt: Date | null = null;
  if (row.currentVersionId) {
    const [version] = await db
      .select({ finalizedAt: deliverableVersions.finalizedAt })
      .from(deliverableVersions)
      .where(
        and(
          eq(deliverableVersions.deliverableId, row.id),
          eq(deliverableVersions.versionId, row.currentVersionId),
        ),
      )
      .limit(1);
    finalizedAt = version?.finalizedAt ?? null;
  }

  const siteUrl =
    row.kind === "url" && row.externalUrl
      ? row.externalUrl
      : buildSiteUrl(slug, config.siteBaseDomain);

  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    description: row.description,
    siteUrl,
    revisionNumber: row.revisionNumber,
    status: row.status,
    claimActive,
    viewCount: row.viewCount,
    likeCount: row.likeCount,
    agent: {
      handle: row.agentHandle ?? "agent",
      displayName: row.agentDisplayName,
    },
    wish: {
      id: row.wishId,
      title: row.wishTitle,
      status: row.wishStatus,
    },
    createdAt: row.createdAt.toISOString(),
    finalizedAt: finalizedAt?.toISOString() ?? null,
  };
}

async function getOrCreateDeliverable(
  wishId: string,
  agentId: string,
  kind: "hosted" | "inline_html" | "url",
  title: string,
  description: string | undefined,
  spaMode: boolean,
) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(deliverables)
    .where(and(eq(deliverables.wishId, wishId), eq(deliverables.agentId, agentId)))
    .limit(1);

  if (existing) return existing;

  const slug = await generateSlug(async (candidate) => {
    const [row] = await db
      .select({ id: deliverables.id })
      .from(deliverables)
      .where(eq(deliverables.slug, candidate))
      .limit(1);
    return Boolean(row);
  }, config.slugBlocklist);

  const [created] = await db
    .insert(deliverables)
    .values({
      wishId,
      agentId,
      slug,
      kind,
      title,
      description,
      spaMode,
      status: "draft",
    })
    .returning();

  return created!;
}

async function markWishDelivered(wishId: string) {
  const db = getDb();
  const [wish] = await db
    .select({ status: wishes.status })
    .from(wishes)
    .where(eq(wishes.id, wishId))
    .limit(1);
  if (wish && canAutoDeliverOnFinalize(wish.status as WishStatus)) {
    await db
      .update(wishes)
      .set({ status: WishStatus.DELIVERED })
      .where(eq(wishes.id, wishId));
  }
}

export async function publishDeliverable(input: {
  agentId: string;
  wishId: string;
  kind: "hosted" | "inline_html" | "url";
  files?: PublishFileDescriptor[];
  inlineHtml?: string;
  externalUrl?: string;
  viewer?: { title: string; description?: string; ogImagePath?: string };
  spaMode?: boolean;
  idempotencyKey?: string;
}): Promise<PublishInitResponse> {
  const db = getDb();
  await requireActiveClaim(input.agentId, input.wishId);
  await requireWishInProgress(input.wishId);

  if (input.idempotencyKey) {
    const [cached] = await db
      .select()
      .from(publishIdempotency)
      .where(
        and(
          eq(publishIdempotency.agentId, input.agentId),
          eq(publishIdempotency.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);
    if (cached && cached.expiresAt > new Date()) {
      return cached.responseJson as PublishInitResponse;
    }
  }

  const title = input.viewer?.title ?? "Deliverable";
  const deliverable = await getOrCreateDeliverable(
    input.wishId,
    input.agentId,
    input.kind,
    title,
    input.viewer?.description,
    input.spaMode ?? false,
  );

  const siteUrl =
    input.kind === "url" && input.externalUrl
      ? input.externalUrl
      : buildSiteUrl(deliverable.slug, config.siteBaseDomain);

  if (input.kind === "url") {
    if (!input.externalUrl) {
      throw new AppError("VALIDATION_ERROR", "externalUrl is required for kind=url", 422);
    }
    await db
      .update(deliverables)
      .set({
        externalUrl: input.externalUrl,
        status: "live",
        revisionNumber: 1,
        title,
        description: input.viewer?.description,
        updatedAt: new Date(),
      })
      .where(eq(deliverables.id, deliverable.id));
    await markWishDelivered(input.wishId);
    await bumpClaimActivity(input.wishId, input.agentId);

    const response: PublishInitResponse = {
      deliverableId: deliverable.id,
      slug: deliverable.slug,
      siteUrl: input.externalUrl,
    };
    await storeIdempotency(input, response, deliverable.id, "url");
    return response;
  }

  if (input.kind === "inline_html") {
    if (!input.inlineHtml) {
      throw new AppError("VALIDATION_ERROR", "inlineHtml is required", 422);
    }
    if (Buffer.byteLength(input.inlineHtml, "utf8") > MAX_INLINE_HTML_BYTES) {
      throw new AppError("VALIDATION_ERROR", "inlineHtml exceeds 256KB", 422);
    }

    const versionId = ulid().toLowerCase();
    const s3 = getS3Client();
    await putInlineHtml(s3, config.s3.bucket, deliverable.slug, versionId, input.inlineHtml);

    const [versionRow] = await db
      .insert(deliverableVersions)
      .values({
        deliverableId: deliverable.id,
        versionId,
        viewerMetadata: input.viewer ?? {},
        finalizeStatus: "pending",
      })
      .returning();

    await db.insert(deliverableFiles).values({
      versionId: versionRow!.id,
      path: "index.html",
      size: Buffer.byteLength(input.inlineHtml, "utf8"),
      contentType: "text/html; charset=utf-8",
    });

    const finalize = await finalizeHostedVersion({
      s3,
      bucket: config.s3.bucket,
      slug: deliverable.slug,
      versionId,
      files: [{ path: "index.html", size: Buffer.byteLength(input.inlineHtml, "utf8"), contentType: "text/html" }],
      spaMode: deliverable.spaMode,
      revisionNumber: deliverable.revisionNumber,
      siteBaseDomain: config.siteBaseDomain,
    });

    await db
      .update(deliverableVersions)
      .set({ finalizeStatus: "finalized", finalizedAt: new Date() })
      .where(eq(deliverableVersions.id, versionRow!.id));

    await db
      .update(deliverables)
      .set({
        currentVersionId: versionId,
        revisionNumber: finalize.revisionNumber,
        status: "live",
        title,
        updatedAt: new Date(),
      })
      .where(eq(deliverables.id, deliverable.id));

    await markWishDelivered(input.wishId);
    await bumpClaimActivity(input.wishId, input.agentId);

    const response: PublishInitResponse = {
      deliverableId: deliverable.id,
      slug: deliverable.slug,
      siteUrl: finalize.siteUrl,
    };
    await storeIdempotency(input, response, deliverable.id, versionId);
    return response;
  }

  const files = input.files ?? [];
  if (!files.length) {
    throw new AppError("VALIDATION_ERROR", "files are required for kind=hosted", 422);
  }

  const versionId = ulid().toLowerCase();
  const expiresAt = new Date(Date.now() + PRESIGN_EXPIRES_SECONDS * 1000);
  const [versionRow] = await db
    .insert(deliverableVersions)
    .values({
      deliverableId: deliverable.id,
      versionId,
      viewerMetadata: input.viewer ?? {},
      finalizeStatus: "pending",
      presignExpiresAt: expiresAt,
    })
    .returning();

  await db.insert(deliverableFiles).values(
    files.map((file) => ({
      versionId: versionRow!.id,
      path: file.path,
      size: file.size,
      contentType: file.contentType,
      hash: file.hash,
    })),
  );

  const s3 = getS3Client();
  const { uploads, skipped } = await createPresignedUploads(
    s3,
    config.s3.bucket,
    deliverable.slug,
    versionId,
    files,
  );

  await bumpClaimActivity(input.wishId, input.agentId);

  const response: PublishInitResponse = {
    deliverableId: deliverable.id,
    slug: deliverable.slug,
    siteUrl,
    upload: {
      versionId,
      uploads,
      skipped,
      finalizeUrl: `${config.apiBaseUrl}/api/v1/deliverables/${deliverable.slug}/finalize`,
      expiresInSeconds: PRESIGN_EXPIRES_SECONDS,
    },
  };

  await storeIdempotency(input, response, deliverable.id, versionId);
  return response;
}

async function storeIdempotency(
  input: { agentId: string; idempotencyKey?: string },
  response: PublishInitResponse,
  deliverableId: string,
  versionId: string,
) {
  if (!input.idempotencyKey) return;
  const db = getDb();
  await db
    .insert(publishIdempotency)
    .values({
      agentId: input.agentId,
      idempotencyKey: input.idempotencyKey,
      deliverableId,
      versionId,
      responseJson: response as unknown as Record<string, unknown>,
      expiresAt: new Date(Date.now() + PRESIGN_EXPIRES_SECONDS * 1000),
    })
    .onConflictDoNothing({
      target: [publishIdempotency.agentId, publishIdempotency.idempotencyKey],
    });
}

export async function finalizeDeliverable(input: {
  agentId: string;
  slug: string;
  versionId: string;
}) {
  const db = getDb();
  const [row] = await db
    .select({
      deliverable: deliverables,
      version: deliverableVersions,
    })
    .from(deliverables)
    .innerJoin(
      deliverableVersions,
      and(
        eq(deliverableVersions.deliverableId, deliverables.id),
        eq(deliverableVersions.versionId, input.versionId),
      ),
    )
    .where(eq(deliverables.slug, input.slug))
    .limit(1);

  if (!row) {
    throw new AppError("DELIVERABLE_NOT_FOUND", "Deliverable or version not found", 404);
  }
  if (row.deliverable.agentId !== input.agentId) {
    throw new AppError("FORBIDDEN", "Not the deliverable owner", 403);
  }

  await requireActiveClaim(input.agentId, row.deliverable.wishId);

  const alreadyFinalized = row.version.finalizeStatus === "finalized";
  const files = await db
    .select({
      path: deliverableFiles.path,
      size: deliverableFiles.size,
      contentType: deliverableFiles.contentType,
    })
    .from(deliverableFiles)
    .where(eq(deliverableFiles.versionId, row.version.id));

  const s3 = getS3Client();
  const result = await finalizeHostedVersion({
    s3,
    bucket: config.s3.bucket,
    slug: row.deliverable.slug,
    versionId: input.versionId,
    files,
    spaMode: row.deliverable.spaMode,
    revisionNumber: row.deliverable.revisionNumber,
    alreadyFinalized,
    siteBaseDomain: config.siteBaseDomain,
  });

  if (!alreadyFinalized) {
    await db
      .update(deliverableVersions)
      .set({ finalizeStatus: "finalized", finalizedAt: new Date() })
      .where(eq(deliverableVersions.id, row.version.id));

    await db
      .update(deliverables)
      .set({
        currentVersionId: input.versionId,
        revisionNumber: result.revisionNumber,
        status: "live",
        updatedAt: new Date(),
      })
      .where(eq(deliverables.id, row.deliverable.id));

    await markWishDelivered(row.deliverable.wishId);
  }

  await bumpClaimActivity(row.deliverable.wishId, input.agentId);
  return result;
}

export async function updateDeliverableFiles(input: {
  agentId: string;
  slug: string;
  files: PublishFileDescriptor[];
}) {
  const db = getDb();
  const [deliverable] = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.slug, input.slug))
    .limit(1);

  if (!deliverable) {
    throw new AppError("DELIVERABLE_NOT_FOUND", "Deliverable not found", 404);
  }
  if (deliverable.agentId !== input.agentId) {
    throw new AppError("FORBIDDEN", "Not the deliverable owner", 403);
  }
  await requireActiveClaim(input.agentId, deliverable.wishId);

  const versionId = ulid().toLowerCase();
  const expiresAt = new Date(Date.now() + PRESIGN_EXPIRES_SECONDS * 1000);
  const [versionRow] = await db
    .insert(deliverableVersions)
    .values({
      deliverableId: deliverable.id,
      versionId,
      finalizeStatus: "pending",
      presignExpiresAt: expiresAt,
    })
    .returning();

  await db.insert(deliverableFiles).values(
    input.files.map((file) => ({
      versionId: versionRow!.id,
      path: file.path,
      size: file.size,
      contentType: file.contentType,
      hash: file.hash,
    })),
  );

  const s3 = getS3Client();
  const { uploads, skipped } = await createPresignedUploads(
    s3,
    config.s3.bucket,
    deliverable.slug,
    versionId,
    input.files,
  );

  await bumpClaimActivity(deliverable.wishId, input.agentId);

  return {
    versionId,
    uploads,
    skipped,
    finalizeUrl: `${config.apiBaseUrl}/api/v1/deliverables/${deliverable.slug}/finalize`,
    expiresInSeconds: PRESIGN_EXPIRES_SECONDS,
  };
}

export async function patchDeliverableMetadata(input: {
  agentId: string;
  slug: string;
  title?: string;
  description?: string;
}) {
  const db = getDb();
  const [deliverable] = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.slug, input.slug))
    .limit(1);
  if (!deliverable) {
    throw new AppError("DELIVERABLE_NOT_FOUND", "Deliverable not found", 404);
  }
  if (deliverable.agentId !== input.agentId) {
    throw new AppError("FORBIDDEN", "Not the deliverable owner", 403);
  }

  const [updated] = await db
    .update(deliverables)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: new Date(),
    })
    .where(eq(deliverables.id, deliverable.id))
    .returning();

  return updated!;
}

export async function deleteDeliverable(input: { agentId: string; slug: string }) {
  const db = getDb();
  const [deliverable] = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.slug, input.slug))
    .limit(1);
  if (!deliverable) {
    throw new AppError("DELIVERABLE_NOT_FOUND", "Deliverable not found", 404);
  }
  if (deliverable.agentId !== input.agentId) {
    throw new AppError("FORBIDDEN", "Not the deliverable owner", 403);
  }
  await requireActiveClaim(input.agentId, deliverable.wishId);

  if (deliverable.status === "draft") {
    await db.delete(deliverables).where(eq(deliverables.id, deliverable.id));
    return { deleted: true, archived: false };
  }

  const [wish] = await db
    .select({ status: wishes.status })
    .from(wishes)
    .where(eq(wishes.id, deliverable.wishId))
    .limit(1);

  if (wish?.status === "accepted") {
    throw new AppError("FORBIDDEN", "Cannot delete accepted deliverable", 403);
  }

  await db
    .update(deliverables)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(deliverables.id, deliverable.id));

  return { deleted: false, archived: true };
}

export async function abandonExpiredUploads() {
  const db = getDb();
  const now = new Date();
  const expired = await db
    .select({
      version: deliverableVersions,
      deliverable: deliverables,
    })
    .from(deliverableVersions)
    .innerJoin(deliverables, eq(deliverableVersions.deliverableId, deliverables.id))
    .where(
      and(
        eq(deliverableVersions.finalizeStatus, "pending"),
        lt(deliverableVersions.presignExpiresAt, now),
      ),
    );

  for (const row of expired) {
    await db
      .update(deliverableVersions)
      .set({ finalizeStatus: "abandoned" })
      .where(eq(deliverableVersions.id, row.version.id));
  }

  return expired.length;
}