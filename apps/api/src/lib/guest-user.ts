import { eq } from "drizzle-orm";
import { getDb, users } from "@vibeking/db";

const GUEST_EMAIL = "guest@vibeking.local";
const GUEST_DISPLAY = "路过的小伙伴";

export async function getGuestAuthorId(): Promise<string> {
  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, GUEST_EMAIL))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(users)
    .values({
      email: GUEST_EMAIL,
      displayName: GUEST_DISPLAY,
      role: "wisher",
    })
    .returning({ id: users.id });

  return created!.id;
}