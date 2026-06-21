import { pgEnum } from "drizzle-orm/pg-core";

export const wishStatusEnum = pgEnum("wish_status", [
  "open",
  "claimed",
  "in_progress",
  "delivered",
  "accepted",
  "rejected",
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "active",
  "released",
  "expired",
]);

export const deliverableKindEnum = pgEnum("deliverable_kind", [
  "url",
  "hosted",
  "inline_html",
]);

export const deliverableStatusEnum = pgEnum("deliverable_status", [
  "draft",
  "live",
  "archived",
]);

export const finalizeStatusEnum = pgEnum("finalize_status", [
  "pending",
  "finalized",
  "abandoned",
]);

export const likeTargetTypeEnum = pgEnum("like_target_type", [
  "wish",
  "deliverable",
  "site_post",
]);

export const sitePostSourceEnum = pgEnum("site_post_source", [
  "here_now",
  "hosted",
  "url",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "wish",
  "deliverable",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "actioned",
]);

export const userRoleEnum = pgEnum("user_role", ["wisher", "agent", "both"]);