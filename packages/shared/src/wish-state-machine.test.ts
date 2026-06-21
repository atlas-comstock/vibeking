import { describe, expect, it } from "vitest";
import { WishStatus } from "./enums.js";
import {
  assertTransition,
  canTransition,
  getEditableFields,
  validatePatchFields,
  agentStatusPatchValue,
} from "./wish-state-machine.js";
import { AppError } from "./errors.js";

describe("wish state machine", () => {
  it("allows claim from open by agent", () => {
    expect(canTransition(WishStatus.OPEN, "claim", "agent")).toBe(true);
    expect(assertTransition(WishStatus.OPEN, "claim", "agent")).toBe(
      WishStatus.CLAIMED,
    );
  });

  it("rejects claim when not open", () => {
    expect(() =>
      assertTransition(WishStatus.CLAIMED, "claim", "agent"),
    ).toThrow(AppError);
  });

  it("covers full happy path", () => {
    expect(assertTransition(WishStatus.CLAIMED, "start_work", "agent")).toBe(
      WishStatus.IN_PROGRESS,
    );
    expect(assertTransition(WishStatus.IN_PROGRESS, "deliver", "system")).toBe(
      WishStatus.DELIVERED,
    );
    expect(assertTransition(WishStatus.DELIVERED, "accept", "author")).toBe(
      WishStatus.ACCEPTED,
    );
  });

  it("covers reject and revise path", () => {
    expect(assertTransition(WishStatus.DELIVERED, "reject", "author")).toBe(
      WishStatus.REJECTED,
    );
    expect(assertTransition(WishStatus.REJECTED, "revise", "agent")).toBe(
      WishStatus.IN_PROGRESS,
    );
  });

  it("covers release and expire to open", () => {
    expect(assertTransition(WishStatus.CLAIMED, "release", "agent")).toBe(
      WishStatus.OPEN,
    );
    expect(assertTransition(WishStatus.IN_PROGRESS, "expire", "sweeper")).toBe(
      WishStatus.OPEN,
    );
  });

  it("enforces PATCH field rules per status", () => {
    expect(getEditableFields(WishStatus.OPEN)).toContain("title");
    expect(getEditableFields(WishStatus.CLAIMED)).toEqual([
      "description",
      "deadline",
    ]);
    expect(getEditableFields(WishStatus.DELIVERED)).toEqual([]);

    expect(() =>
      validatePatchFields(WishStatus.OPEN, { title: "new" }),
    ).not.toThrow();
    expect(() =>
      validatePatchFields(WishStatus.DELIVERED, { title: "x" }),
    ).toThrow(AppError);
    expect(() =>
      validatePatchFields(WishStatus.OPEN, { status: WishStatus.CLAIMED }),
    ).toThrow(AppError);
  });

  it("agent status patch only from claimed or rejected", () => {
    expect(agentStatusPatchValue(WishStatus.CLAIMED)).toBe(
      WishStatus.IN_PROGRESS,
    );
    expect(agentStatusPatchValue(WishStatus.REJECTED)).toBe(
      WishStatus.IN_PROGRESS,
    );
    expect(agentStatusPatchValue(WishStatus.OPEN)).toBeNull();
  });
});