import { randomBytes } from "node:crypto";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, magicLinkTokens, users } from "@vibeking/db";
import { UserRole } from "@vibeking/shared";
import {
  createSessionToken,
  setSessionCookie,
} from "../../middleware/auth.js";
import { validateInviteCode, consumeInviteCode } from "../../services/invite-service.js";

export const magicLinkRoutes = new Hono();

magicLinkRoutes.post("/magic-link/request", async (c) => {
  const body = await c.req.json<{ email: string; inviteCode?: string }>();
  await validateInviteCode(body.inviteCode);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const db = getDb();
  await db.insert(magicLinkTokens).values({
    email: body.email.toLowerCase(),
    token,
    expiresAt,
  });

  console.log(`[dev] Magic link for ${body.email}: ${token}`);

  return c.json({
    ok: true,
    message: "Magic link sent (dev: code logged to console)",
    devToken: process.env.NODE_ENV === "production" ? undefined : token,
  });
});

magicLinkRoutes.post("/magic-link/verify", async (c) => {
  const body = await c.req.json<{ token: string; inviteCode?: string }>();
  const db = getDb();
  const now = new Date();

  const [record] = await db
    .select()
    .from(magicLinkTokens)
    .where(eq(magicLinkTokens.token, body.token))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt < now) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
  }

  await validateInviteCode(body.inviteCode);

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, record.email))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: record.email,
        displayName: record.email.split("@")[0]!,
        role: UserRole.WISHER,
      })
      .returning();
    if (body.inviteCode) {
      await consumeInviteCode(body.inviteCode, user!.id);
    }
  }

  await db
    .update(magicLinkTokens)
    .set({ usedAt: now })
    .where(eq(magicLinkTokens.id, record.id));

  const sessionToken = await createSessionToken(user!.id);
  setSessionCookie(c, sessionToken);

  return c.json({ ok: true, userId: user!.id });
});