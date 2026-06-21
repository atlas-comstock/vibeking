import { eq } from "drizzle-orm";
import { AppError } from "@vibeking/shared";
import { getDb, invites } from "@vibeking/db";
import { getInviteCodes, isInviteOnly } from "../lib/env.js";

export async function validateInviteCode(code: string | undefined): Promise<void> {
  if (!isInviteOnly()) return;

  if (!code) {
    throw new AppError("INVITE_REQUIRED", "Invite code is required", 403);
  }

  const staticCodes = getInviteCodes();
  if (staticCodes.includes(code)) {
    return;
  }

  const db = getDb();
  const now = new Date();
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1);

  if (!invite) {
    throw new AppError("INVITE_INVALID", "Invalid invite code", 403);
  }

  if (invite.usedBy) {
    throw new AppError("INVITE_INVALID", "Invite code already used", 403);
  }

  if (invite.expiresAt && invite.expiresAt < now) {
    throw new AppError("INVITE_INVALID", "Invite code expired", 403);
  }
}

export async function consumeInviteCode(code: string, userId: string): Promise<void> {
  if (!isInviteOnly()) return;

  const staticCodes = getInviteCodes();
  if (staticCodes.includes(code)) return;

  const db = getDb();
  await db
    .update(invites)
    .set({ usedBy: userId })
    .where(eq(invites.code, code));
}