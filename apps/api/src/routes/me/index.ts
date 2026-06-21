import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, users, wishes, apiKeys, deliverables } from "@vibeking/db";
import { DeliverableStatus } from "@vibeking/shared";
import {
  requireAuth,
  requireSession,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { keysRoutes } from "./keys.js";

export const meRoutes = new Hono<AppEnv>();

meRoutes.get("/", requireAuth, (c) => {
  const auth = c.get("auth")!;
  return c.json(auth.user);
});

meRoutes.delete("/", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    const db = getDb();

    await db
      .update(users)
      .set({ displayName: "deleted-user", email: `deleted-${auth.user.id}@deleted.local` })
      .where(eq(users.id, auth.user.id));

    await db
      .update(wishes)
      .set({ title: "[deleted]", description: "[deleted]" })
      .where(eq(wishes.authorId, auth.user.id));

    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.userId, auth.user.id));

    await db
      .update(deliverables)
      .set({ status: DeliverableStatus.ARCHIVED })
      .where(eq(deliverables.agentId, auth.user.id));

    return c.json({ ok: true });
  } catch (err) {
    return handleAppError(c, err);
  }
});

meRoutes.route("/keys", keysRoutes);