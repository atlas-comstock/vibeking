import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  claimStatusEnum,
  deliverableKindEnum,
  deliverableStatusEnum,
  finalizeStatusEnum,
  likeTargetTypeEnum,
  reportStatusEnum,
  reportTargetTypeEnum,
  sitePostSourceEnum,
  userRoleEnum,
  wishStatusEnum,
} from "./enums.js";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("wisher"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentProfiles = pgTable(
  "agent_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    handle: varchar("handle", { length: 50 }).notNull().unique(),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    completedWishesCount: integer("completed_wishes_count").notNull().default(0),
    liveDeliverablesCount: integer("live_deliverables_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("idx_agent_profiles_handle").on(t.handle)],
);

export const wishes = pgTable(
  "wishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    tags: text("tags").array().notNull().default([]),
    coverUrl: varchar("cover_url", { length: 2000 }),
    budgetCents: integer("budget_cents"),
    budgetCurrency: varchar("budget_currency", { length: 3 }).default("CNY"),
    deadline: timestamp("deadline", { withTimezone: true }),
    status: wishStatusEnum("status").notNull().default("open"),
    acceptedDeliverableId: uuid("accepted_deliverable_id"),
    viewCount: integer("view_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_wishes_status_created").on(t.status, t.createdAt),
    index("idx_wishes_not_deleted").on(t.status, t.createdAt),
  ],
);

export const wishReplies = pgTable(
  "wish_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wishId: uuid("wish_id")
      .notNull()
      .references(() => wishes.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    nickname: varchar("nickname", { length: 50 }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_wish_replies_wish_created").on(t.wishId, t.createdAt)],
);

export const wishClaims = pgTable(
  "wish_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wishId: uuid("wish_id")
      .notNull()
      .references(() => wishes.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => users.id),
    status: claimStatusEnum("status").notNull().default("active"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("idx_wish_claims_active")
      .on(t.wishId)
      .where(sql`status = 'active'`),
  ],
);

export const deliverables = pgTable(
  "deliverables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    wishId: uuid("wish_id")
      .notNull()
      .references(() => wishes.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => users.id),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    kind: deliverableKindEnum("kind").notNull(),
    externalUrl: varchar("external_url", { length: 2000 }),
    title: varchar("title", { length: 200 }).notNull().default(""),
    description: text("description"),
    currentVersionId: varchar("current_version_id", { length: 32 }),
    revisionNumber: integer("revision_number").notNull().default(0),
    spaMode: boolean("spa_mode").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    status: deliverableStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_deliverables_slug").on(t.slug),
    uniqueIndex("idx_deliverables_wish_agent").on(t.wishId, t.agentId),
  ],
);

export const deliverableVersions = pgTable("deliverable_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deliverableId: uuid("deliverable_id")
    .notNull()
    .references(() => deliverables.id, { onDelete: "cascade" }),
  versionId: varchar("version_id", { length: 32 }).notNull(),
  viewerMetadata: jsonb("viewer_metadata").$type<Record<string, unknown>>().default({}),
  finalizeStatus: finalizeStatusEnum("finalize_status").notNull().default("pending"),
  presignExpiresAt: timestamp("presign_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
});

export const deliverableFiles = pgTable("deliverable_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => deliverableVersions.id, { onDelete: "cascade" }),
  path: varchar("path", { length: 500 }).notNull(),
  size: integer("size").notNull(),
  contentType: varchar("content_type", { length: 200 }).notNull(),
  hash: varchar("hash", { length: 64 }),
});

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    viewerKey: varchar("viewer_key", { length: 64 }),
    targetType: likeTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_likes_target").on(t.targetType, t.targetId),
    uniqueIndex("idx_likes_user_target").on(t.userId, t.targetType, t.targetId),
    uniqueIndex("idx_likes_viewer_target").on(t.viewerKey, t.targetType, t.targetId),
  ],
);

export const viewEvents = pgTable(
  "view_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: likeTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    viewerKey: varchar("viewer_key", { length: 64 }).notNull(),
    dateBucket: varchar("date_bucket", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_view_events_dedupe").on(
      t.targetType,
      t.targetId,
      t.viewerKey,
      t.dateBucket,
    ),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_reports_target").on(t.targetType, t.targetId, t.status)],
);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  keySuffix: varchar("key_suffix", { length: 8 }).notNull(),
  scopes: text("scopes").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  usedBy: uuid("used_by").references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const statusEvents = pgTable("status_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  wishId: uuid("wish_id")
    .notNull()
    .references(() => wishes.id, { onDelete: "cascade" }),
  fromStatus: wishStatusEnum("from_status").notNull(),
  toStatus: wishStatusEnum("to_status").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deliverableDataRecords = pgTable(
  "deliverable_data_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deliverableId: uuid("deliverable_id")
      .notNull()
      .references(() => deliverables.id, { onDelete: "cascade" }),
    collection: varchar("collection", { length: 100 }).notNull(),
    recordId: varchar("record_id", { length: 64 }).notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_deliverable_data_records_unique").on(
      t.deliverableId,
      t.collection,
      t.recordId,
    ),
    index("idx_deliverable_data_records_collection").on(t.deliverableId, t.collection),
  ],
);

export const magicLinkTokens = pgTable("magic_link_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agentVerificationCodes = pgTable("agent_verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  inviteCode: varchar("invite_code", { length: 64 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sitePosts = pgTable(
  "site_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 64 }),
    siteUrl: varchar("site_url", { length: 2000 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    coverEmoji: varchar("cover_emoji", { length: 8 }).default("✨"),
    tags: text("tags").array().notNull().default([]),
    source: sitePostSourceEnum("source").notNull().default("here_now"),
    likeCount: integer("like_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_site_posts_created").on(t.createdAt),
    index("idx_site_posts_source").on(t.source),
  ],
);

export const publishIdempotency = pgTable(
  "publish_idempotency",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
    deliverableId: uuid("deliverable_id").notNull(),
    versionId: varchar("version_id", { length: 32 }).notNull(),
    responseJson: jsonb("response_json").$type<Record<string, unknown>>().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_publish_idempotency_key").on(t.agentId, t.idempotencyKey),
  ],
);