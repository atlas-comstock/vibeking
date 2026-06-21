import { and, eq, gte } from "drizzle-orm";
import { AppError, TargetType } from "@vibeking/shared";
import type { TargetType as TargetTypeValue } from "@vibeking/shared";
import { deliverables, getDb, reports, wishes } from "@vibeking/db";

export async function createReport(input: {
  reporterId: string;
  targetType: TargetTypeValue;
  targetId: string;
  reason: string;
}) {
  const db = getDb();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const allToday = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(eq(reports.reporterId, input.reporterId), gte(reports.createdAt, startOfDay)),
    );
  if (allToday.length >= 10) {
    throw new AppError("RATE_LIMITED", "Report limit exceeded (10/day)", 429);
  }

  if (input.targetType === TargetType.WISH) {
    const [wish] = await db
      .select({ id: wishes.id })
      .from(wishes)
      .where(eq(wishes.id, input.targetId))
      .limit(1);
    if (!wish) throw new AppError("INVALID_TARGET", "Wish not found", 404);
  } else {
    const [deliverable] = await db
      .select({ id: deliverables.id })
      .from(deliverables)
      .where(eq(deliverables.id, input.targetId))
      .limit(1);
    if (!deliverable) {
      throw new AppError("INVALID_TARGET", "Deliverable not found", 404);
    }
  }

  const [created] = await db
    .insert(reports)
    .values({
      targetType: input.targetType,
      targetId: input.targetId,
      reporterId: input.reporterId,
      reason: input.reason,
      status: "open",
    })
    .returning();

  return {
    id: created!.id,
    targetType: created!.targetType,
    targetId: created!.targetId,
    status: created!.status,
    createdAt: created!.createdAt.toISOString(),
  };
}