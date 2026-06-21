import { and, eq, isNull, sql } from "drizzle-orm";
import {
  AppError,
  assertTransition,
  WishStatus,
  ClaimStatus,
  DeliverableStatus,
  agentStatusPatchValue,
} from "@vibeking/shared";
import {
  getDb,
  wishes,
  wishClaims,
  deliverables,
  agentProfiles,
} from "@vibeking/db";
import { logStatusEvent } from "./status-event-service.js";
import { rateLimitAction } from "../middleware/rate-limit.js";

const CLAIMS_PER_DAY = 50;
const INACTIVITY_DAYS = 7;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getWishForUpdate(wishId: string, tx: any) {
  const [wish] = await tx
    .select()
    .from(wishes)
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .for("update")
    .limit(1);

  if (!wish) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  return {
    id: wish.id,
    authorId: wish.authorId,
    status: wish.status as WishStatus,
    acceptedDeliverableId: wish.acceptedDeliverableId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getActiveClaim(wishId: string, tx: any) {
  const [claim] = await tx
    .select()
    .from(wishClaims)
    .where(and(eq(wishClaims.wishId, wishId), eq(wishClaims.status, ClaimStatus.ACTIVE)))
    .limit(1);
  return claim ?? null;
}

export async function claimWish(wishId: string, agentId: string) {
  if (!rateLimitAction(`claims:${agentId}`, CLAIMS_PER_DAY, 86_400_000)) {
    throw new AppError("RATE_LIMITED", "Claim rate limit exceeded", 429);
  }

  const db = getDb();
  return db.transaction(async (tx) => {
    const wish = await getWishForUpdate(wishId, tx);

    const existing = await getActiveClaim(wishId, tx);
    if (existing) {
      throw new AppError("WISH_ALREADY_CLAIMED", "Wish already has an active claim", 409);
    }

    const toStatus = assertTransition(wish.status, "claim", "agent");

    const now = new Date();
    const [claim] = await tx
      .insert(wishClaims)
      .values({
        wishId,
        agentId,
        status: ClaimStatus.ACTIVE,
        claimedAt: now,
        lastActivityAt: now,
      })
      .returning();

    await tx
      .update(wishes)
      .set({ status: toStatus })
      .where(eq(wishes.id, wishId));

    await logStatusEvent(
      {
        wishId,
        fromStatus: wish.status,
        toStatus,
        actorId: agentId,
        metadata: { action: "claim", claimId: claim!.id },
      },
      tx,
    );

    return claim!;
  });
}

export async function releaseClaim(wishId: string, agentId: string) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const wish = await getWishForUpdate(wishId, tx);
    const claim = await getActiveClaim(wishId, tx);

    if (!claim) {
      throw new AppError("CLAIM_NOT_FOUND", "No active claim found", 404);
    }

    if (claim.agentId !== agentId) {
      throw new AppError("NOT_CLAIM_OWNER", "Not the claiming agent", 403);
    }

    const toStatus = assertTransition(wish.status, "release", "agent");
    const now = new Date();

    await tx
      .update(wishClaims)
      .set({ status: ClaimStatus.RELEASED, releasedAt: now })
      .where(eq(wishClaims.id, claim.id));

    await tx
      .update(wishes)
      .set({ status: toStatus })
      .where(eq(wishes.id, wishId));

    await tx
      .update(deliverables)
      .set({ status: DeliverableStatus.ARCHIVED })
      .where(
        and(
          eq(deliverables.wishId, wishId),
          eq(deliverables.agentId, agentId),
          eq(deliverables.status, DeliverableStatus.DRAFT),
        ),
      );

    await logStatusEvent(
      {
        wishId,
        fromStatus: wish.status,
        toStatus,
        actorId: agentId,
        metadata: { action: "release", claimId: claim.id },
      },
      tx,
    );

    return { wishId, status: toStatus };
  });
}

export async function patchAgentStatus(wishId: string, agentId: string) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const wish = await getWishForUpdate(wishId, tx);
    const claim = await getActiveClaim(wishId, tx);

    if (!claim) {
      throw new AppError("CLAIM_NOT_FOUND", "No active claim found", 404);
    }

    if (claim.agentId !== agentId) {
      throw new AppError("NOT_CLAIM_OWNER", "Not the claiming agent", 403);
    }

    const targetStatus = agentStatusPatchValue(wish.status);
    if (!targetStatus) {
      throw new AppError(
        "INVALID_STATUS_TRANSITION",
        `Cannot transition from status '${wish.status}'`,
        409,
      );
    }

    const transition = wish.status === WishStatus.CLAIMED ? "start_work" : "revise";
    const toStatus = assertTransition(wish.status, transition, "agent");
    const now = new Date();

    await tx
      .update(wishes)
      .set({ status: toStatus })
      .where(eq(wishes.id, wishId));

    await tx
      .update(wishClaims)
      .set({ lastActivityAt: now })
      .where(eq(wishClaims.id, claim.id));

    await logStatusEvent(
      {
        wishId,
        fromStatus: wish.status,
        toStatus,
        actorId: agentId,
        metadata: { action: "agent_status_patch" },
      },
      tx,
    );

    return { wishId, status: toStatus };
  });
}

export async function acceptWish(wishId: string, authorId: string) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const wish = await getWishForUpdate(wishId, tx);

    if (wish.authorId !== authorId) {
      throw new AppError("FORBIDDEN", "Only the author can accept", 403);
    }

    const toStatus = assertTransition(wish.status, "accept", "author");

    const claim = await getActiveClaim(wishId, tx);
    const agentId = claim?.agentId;

    let canonicalDeliverableId: string | null = null;
    if (agentId) {
      const [canonical] = await tx
        .select()
        .from(deliverables)
        .where(
          and(
            eq(deliverables.wishId, wishId),
            eq(deliverables.agentId, agentId),
            eq(deliverables.status, DeliverableStatus.LIVE),
          ),
        )
        .orderBy(sql`${deliverables.revisionNumber} DESC`)
        .limit(1);

      canonicalDeliverableId = canonical?.id ?? null;

      await tx
        .update(deliverables)
        .set({ status: DeliverableStatus.ARCHIVED })
        .where(
          and(
            eq(deliverables.wishId, wishId),
            eq(deliverables.status, DeliverableStatus.LIVE),
            canonicalDeliverableId
              ? sql`${deliverables.id} != ${canonicalDeliverableId}`
              : sql`true`,
          ),
        );
    }

    await tx
      .update(wishes)
      .set({
        status: toStatus,
        acceptedDeliverableId: canonicalDeliverableId,
      })
      .where(eq(wishes.id, wishId));

    if (agentId) {
      await tx
        .update(agentProfiles)
        .set({
          completedWishesCount: sql`${agentProfiles.completedWishesCount} + 1`,
        })
        .where(eq(agentProfiles.userId, agentId));
    }

    await logStatusEvent(
      {
        wishId,
        fromStatus: wish.status,
        toStatus,
        actorId: authorId,
        metadata: {
          action: "accept",
          acceptedDeliverableId: canonicalDeliverableId,
        },
      },
      tx,
    );

    return { wishId, status: toStatus, acceptedDeliverableId: canonicalDeliverableId };
  });
}

export async function rejectWish(
  wishId: string,
  authorId: string,
  reason?: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const wish = await getWishForUpdate(wishId, tx);

    if (wish.authorId !== authorId) {
      throw new AppError("FORBIDDEN", "Only the author can reject", 403);
    }

    const toStatus = assertTransition(wish.status, "reject", "author");

    await tx
      .update(wishes)
      .set({ status: toStatus })
      .where(eq(wishes.id, wishId));

    await logStatusEvent(
      {
        wishId,
        fromStatus: wish.status,
        toStatus,
        actorId: authorId,
        metadata: { action: "reject", reason: reason ?? null },
      },
      tx,
    );

    return { wishId, status: toStatus };
  });
}

export async function sweepInactiveClaims() {
  const db = getDb();
  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const stale = await db
    .select()
    .from(wishClaims)
    .where(
      and(
        eq(wishClaims.status, ClaimStatus.ACTIVE),
        sql`${wishClaims.lastActivityAt} < ${cutoff}`,
      ),
    );

  let expired = 0;
  for (const claim of stale) {
    try {
      await db.transaction(async (tx) => {
        const wish = await getWishForUpdate(claim.wishId, tx);
        if (wish.status !== WishStatus.CLAIMED && wish.status !== WishStatus.IN_PROGRESS) {
          return;
        }

        const toStatus = assertTransition(wish.status, "expire", "sweeper");
        const now = new Date();

        await tx
          .update(wishClaims)
          .set({ status: ClaimStatus.EXPIRED, releasedAt: now })
          .where(eq(wishClaims.id, claim.id));

        await tx
          .update(wishes)
          .set({ status: toStatus })
          .where(eq(wishes.id, claim.wishId));

        await tx
          .update(deliverables)
          .set({ status: DeliverableStatus.ARCHIVED })
          .where(
            and(
              eq(deliverables.wishId, claim.wishId),
              eq(deliverables.agentId, claim.agentId),
              eq(deliverables.status, DeliverableStatus.DRAFT),
            ),
          );

        await logStatusEvent(
          {
            wishId: claim.wishId,
            fromStatus: wish.status,
            toStatus,
            metadata: { action: "expire", claimId: claim.id },
          },
          tx,
        );
      });
      expired += 1;
    } catch (err) {
      console.error("Sweeper error for claim", claim.id, err);
    }
  }

  return expired;
}

export async function requireActiveClaim(agentId: string, wishId: string) {
  const db = getDb();
  const claim = await getActiveClaim(wishId, db);
  if (!claim || claim.agentId !== agentId) {
    throw new AppError("CLAIM_REQUIRED", "Active claim required for this wish", 403);
  }
  return claim;
}

export async function isClaimActive(
  wishId: string,
  agentId: string,
): Promise<boolean> {
  const db = getDb();
  const claim = await getActiveClaim(wishId, db);
  return claim?.agentId === agentId;
}

export async function requireWishInProgress(wishId: string) {
  const db = getDb();
  const [wish] = await db
    .select({ status: wishes.status })
    .from(wishes)
    .where(and(eq(wishes.id, wishId), isNull(wishes.deletedAt)))
    .limit(1);

  if (!wish) {
    throw new AppError("WISH_NOT_FOUND", "Wish not found", 404);
  }

  if (
    wish.status !== WishStatus.IN_PROGRESS &&
    wish.status !== WishStatus.REJECTED
  ) {
    throw new AppError(
      "FORBIDDEN",
      "Wish must be in_progress or rejected to publish",
      403,
    );
  }
}

export async function bumpClaimActivity(wishId: string, agentId: string) {
  const db = getDb();
  await db
    .update(wishClaims)
    .set({ lastActivityAt: new Date() })
    .where(
      and(
        eq(wishClaims.wishId, wishId),
        eq(wishClaims.agentId, agentId),
        eq(wishClaims.status, ClaimStatus.ACTIVE),
      ),
    );
}

/** Exported for unit tests — simulates parallel claim race */
export async function tryClaimWithLock(
  wishId: string,
  agentId: string,
): Promise<"won" | "lost"> {
  try {
    await claimWish(wishId, agentId);
    return "won";
  } catch (err) {
    if (err instanceof AppError && err.code === "WISH_ALREADY_CLAIMED") {
      return "lost";
    }
    throw err;
  }
}