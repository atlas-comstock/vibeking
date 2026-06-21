export const WishStatus = {
  OPEN: "open",
  CLAIMED: "claimed",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type WishStatus = (typeof WishStatus)[keyof typeof WishStatus];

export const WISH_STATUSES = Object.values(WishStatus);

export const DeliverableKind = {
  URL: "url",
  HOSTED: "hosted",
  INLINE_HTML: "inline_html",
} as const;

export type DeliverableKind = (typeof DeliverableKind)[keyof typeof DeliverableKind];

export const DeliverableStatus = {
  DRAFT: "draft",
  LIVE: "live",
  ARCHIVED: "archived",
} as const;

export type DeliverableStatus = (typeof DeliverableStatus)[keyof typeof DeliverableStatus];

export const ClaimStatus = {
  ACTIVE: "active",
  RELEASED: "released",
  EXPIRED: "expired",
} as const;

export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];

export const UserRole = {
  WISHER: "wisher",
  AGENT: "agent",
  BOTH: "both",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ReportStatus = {
  OPEN: "open",
  REVIEWED: "reviewed",
  ACTIONED: "actioned",
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const TargetType = {
  WISH: "wish",
  DELIVERABLE: "deliverable",
} as const;

export type TargetType = (typeof TargetType)[keyof typeof TargetType];

/** @deprecated Use TargetType — kept for existing db helpers */
export type LikeTargetType = TargetType;

export const FinalizeStatus = {
  PENDING: "pending",
  FINALIZED: "finalized",
  ABANDONED: "abandoned",
} as const;

export type FinalizeStatus = (typeof FinalizeStatus)[keyof typeof FinalizeStatus];

export const ApiKeyScope = {
  USER_READ: "user:read",
  USER_WRITE: "user:write",
  AGENT_READ: "agent:read",
  AGENT_WRITE: "agent:write",
} as const;

export type ApiKeyScope = (typeof ApiKeyScope)[keyof typeof ApiKeyScope];

export const API_KEY_SCOPES = Object.values(ApiKeyScope);

export const DEFAULT_AGENT_KEY_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.AGENT_READ,
  ApiKeyScope.AGENT_WRITE,
];

export const DEFAULT_USER_KEY_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.USER_READ,
  ApiKeyScope.USER_WRITE,
];