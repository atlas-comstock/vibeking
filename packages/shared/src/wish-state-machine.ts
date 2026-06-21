import { AppError } from "./errors.js";
import { WishStatus } from "./enums.js";

export type WishTransitionActor = "agent" | "author" | "system" | "sweeper";

export type WishTransition =
  | "claim"
  | "start_work"
  | "deliver"
  | "accept"
  | "reject"
  | "revise"
  | "release"
  | "expire";

const TRANSITIONS: Record<
  WishTransition,
  { from: WishStatus[]; to: WishStatus; actors: WishTransitionActor[] }
> = {
  claim: {
    from: [WishStatus.OPEN],
    to: WishStatus.CLAIMED,
    actors: ["agent"],
  },
  start_work: {
    from: [WishStatus.CLAIMED],
    to: WishStatus.IN_PROGRESS,
    actors: ["agent"],
  },
  deliver: {
    from: [WishStatus.IN_PROGRESS],
    to: WishStatus.DELIVERED,
    actors: ["system"],
  },
  accept: {
    from: [WishStatus.DELIVERED],
    to: WishStatus.ACCEPTED,
    actors: ["author"],
  },
  reject: {
    from: [WishStatus.DELIVERED],
    to: WishStatus.REJECTED,
    actors: ["author"],
  },
  revise: {
    from: [WishStatus.REJECTED],
    to: WishStatus.IN_PROGRESS,
    actors: ["agent"],
  },
  release: {
    from: [WishStatus.CLAIMED, WishStatus.IN_PROGRESS],
    to: WishStatus.OPEN,
    actors: ["agent", "sweeper"],
  },
  expire: {
    from: [WishStatus.CLAIMED, WishStatus.IN_PROGRESS],
    to: WishStatus.OPEN,
    actors: ["sweeper"],
  },
};

export function canTransition(
  from: WishStatus,
  transition: WishTransition,
  actor: WishTransitionActor,
): boolean {
  const rule = TRANSITIONS[transition];
  return rule.from.includes(from) && rule.actors.includes(actor);
}

export function assertTransition(
  from: WishStatus,
  transition: WishTransition,
  actor: WishTransitionActor,
): WishStatus {
  if (!canTransition(from, transition, actor)) {
    throw new AppError(
      "INVALID_STATUS_TRANSITION",
      `Cannot perform '${transition}' from status '${from}' as ${actor}`,
      409,
    );
  }
  return TRANSITIONS[transition].to;
}

export type WishPatchFields = {
  title?: string;
  description?: string;
  tags?: string[];
  coverUrl?: string | null;
  budgetCents?: number | null;
  budgetCurrency?: string;
  deadline?: string | null;
  status?: WishStatus;
};

const EDITABLE_FIELDS: Record<WishStatus, (keyof WishPatchFields)[]> = {
  [WishStatus.OPEN]: [
    "title",
    "description",
    "tags",
    "coverUrl",
    "budgetCents",
    "budgetCurrency",
    "deadline",
  ],
  [WishStatus.CLAIMED]: ["description", "deadline"],
  [WishStatus.IN_PROGRESS]: ["description", "deadline"],
  [WishStatus.DELIVERED]: [],
  [WishStatus.ACCEPTED]: [],
  [WishStatus.REJECTED]: [],
};

export function getEditableFields(status: WishStatus): (keyof WishPatchFields)[] {
  return EDITABLE_FIELDS[status];
}

export function validatePatchFields(
  status: WishStatus,
  patch: WishPatchFields,
): void {
  if (patch.status !== undefined) {
    throw new AppError(
      "STATUS_CHANGE_NOT_ALLOWED",
      "Status changes must use dedicated endpoints",
      400,
    );
  }

  const allowed = new Set(getEditableFields(status));
  const attempted = Object.keys(patch).filter(
    (k) => patch[k as keyof WishPatchFields] !== undefined,
  ) as (keyof WishPatchFields)[];

  const disallowed = attempted.filter((f) => !allowed.has(f));
  if (disallowed.length > 0) {
    throw new AppError(
      "FIELD_NOT_EDITABLE",
      `Fields not editable in status '${status}': ${disallowed.join(", ")}`,
      400,
    );
  }
}

export function agentStatusPatchValue(
  from: WishStatus,
): typeof WishStatus.IN_PROGRESS | null {
  if (from === WishStatus.CLAIMED || from === WishStatus.REJECTED) {
    return WishStatus.IN_PROGRESS;
  }
  return null;
}

export function canAutoDeliverOnFinalize(current: WishStatus): boolean {
  return current === WishStatus.IN_PROGRESS || current === WishStatus.REJECTED;
}