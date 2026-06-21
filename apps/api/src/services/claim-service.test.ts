import { describe, expect, it, vi } from "vitest";
import { AppError, WishStatus } from "@vibeking/shared";

vi.mock("@vibeking/db", () => ({
  getDb: vi.fn(),
  wishes: {},
  wishClaims: {},
  deliverables: {},
  agentProfiles: {},
}));

vi.mock("../middleware/rate-limit.js", () => ({
  rateLimitAction: vi.fn(() => true),
}));

vi.mock("./status-event-service.js", () => ({
  logStatusEvent: vi.fn(),
}));

import { getDb } from "@vibeking/db";
import { claimWish } from "./claim-service.js";

describe("claim race (mocked db)", () => {
  it("only one parallel claim wins when active claim exists", async () => {
    const wish = {
      id: "wish-1",
      authorId: "author-1",
      status: WishStatus.OPEN as WishStatus,
      acceptedDeliverableId: null,
      deletedAt: null,
    };

    let activeClaim: { id: string; agentId: string } | null = null;

    const mockTx = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            for: vi.fn(() => ({
              limit: vi.fn(async () => [wish]),
            })),
            limit: vi.fn(async () => (activeClaim ? [activeClaim] : [])),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(async () => {
            if (activeClaim) {
              throw new Error("unique violation idx_wish_claims_active");
            }
            activeClaim = { id: "claim-1", agentId: "agent-1" };
            return [
              {
                id: "claim-1",
                wishId: "wish-1",
                agentId: "agent-1",
                status: "active",
                claimedAt: new Date(),
                lastActivityAt: new Date(),
              },
            ];
          }),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => []),
        })),
      })),
      execute: vi.fn(),
    };

    vi.mocked(getDb).mockReturnValue({
      transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    } as never);

    const first = await claimWish("wish-1", "agent-1");
    expect(first.id).toBe("claim-1");

    await expect(claimWish("wish-1", "agent-2")).rejects.toMatchObject({
      code: "WISH_ALREADY_CLAIMED",
    } satisfies Partial<AppError>);
  });
});