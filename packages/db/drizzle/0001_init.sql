CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "role" text DEFAULT 'wisher' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "agent_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "handle" text NOT NULL UNIQUE,
  "bio" text,
  "avatar_url" text,
  "completed_wishes_count" integer DEFAULT 0 NOT NULL,
  "live_deliverables_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "key_hash" text NOT NULL,
  "key_suffix" text NOT NULL,
  "scopes" text[] NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "last_used_at" timestamptz,
  "revoked_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "wishes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author_id" uuid NOT NULL REFERENCES "users"("id"),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "budget_cents" integer,
  "budget_currency" text DEFAULT 'CNY' NOT NULL,
  "deadline" timestamptz,
  "status" text DEFAULT 'open' NOT NULL,
  "accepted_deliverable_id" uuid,
  "view_count" integer DEFAULT 0 NOT NULL,
  "like_count" integer DEFAULT 0 NOT NULL,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "wish_claims" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "wish_id" uuid NOT NULL REFERENCES "wishes"("id") ON DELETE CASCADE,
  "agent_id" uuid NOT NULL REFERENCES "users"("id"),
  "status" text DEFAULT 'active' NOT NULL,
  "claimed_at" timestamptz DEFAULT now() NOT NULL,
  "last_activity_at" timestamptz DEFAULT now() NOT NULL,
  "released_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "deliverables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "wish_id" uuid NOT NULL REFERENCES "wishes"("id") ON DELETE CASCADE,
  "agent_id" uuid NOT NULL REFERENCES "users"("id"),
  "slug" text NOT NULL UNIQUE,
  "kind" text NOT NULL,
  "external_url" text,
  "title" text NOT NULL,
  "description" text,
  "current_version_id" text,
  "revision_number" integer DEFAULT 0 NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "like_count" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deliverable_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deliverable_id" uuid NOT NULL REFERENCES "deliverables"("id") ON DELETE CASCADE,
  "version_id" text NOT NULL,
  "viewer_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "finalize_status" text DEFAULT 'pending' NOT NULL,
  "presign_expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deliverable_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deliverable_version_id" uuid NOT NULL REFERENCES "deliverable_versions"("id") ON DELETE CASCADE,
  "path" text NOT NULL,
  "size" integer NOT NULL,
  "content_type" text NOT NULL,
  "hash" text
);

CREATE TABLE IF NOT EXISTS "likes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "target_type" text NOT NULL,
  "target_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "view_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "target_type" text NOT NULL,
  "target_id" uuid NOT NULL,
  "viewer_key" text NOT NULL,
  "date_bucket" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "target_type" text NOT NULL,
  "target_id" uuid NOT NULL,
  "reporter_id" uuid NOT NULL REFERENCES "users"("id"),
  "reason" text NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL UNIQUE,
  "used_by" uuid REFERENCES "users"("id"),
  "expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "status_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "wish_id" uuid NOT NULL REFERENCES "wishes"("id") ON DELETE CASCADE,
  "from_status" text NOT NULL,
  "to_status" text NOT NULL,
  "actor_id" uuid REFERENCES "users"("id"),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deliverable_data_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deliverable_id" uuid NOT NULL REFERENCES "deliverables"("id") ON DELETE CASCADE,
  "collection" text NOT NULL,
  "record_id" text NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "agent_verification_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "code" text NOT NULL,
  "invite_code" text,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_agent_profiles_handle" ON "agent_profiles" ("handle");
CREATE INDEX IF NOT EXISTS "idx_wishes_status_created" ON "wishes" ("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_wishes_tags" ON "wishes" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "idx_wishes_not_deleted" ON "wishes" ("status", "created_at" DESC) WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_wish_claims_active" ON "wish_claims" ("wish_id") WHERE "status" = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS "idx_deliverables_slug" ON "deliverables" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_deliverables_wish_agent" ON "deliverables" ("wish_id", "agent_id");
CREATE INDEX IF NOT EXISTS "idx_likes_target" ON "likes" ("target_type", "target_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_likes_user_target" ON "likes" ("user_id", "target_type", "target_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_view_events_dedupe" ON "view_events" ("target_type", "target_id", "viewer_key", "date_bucket");
CREATE INDEX IF NOT EXISTS "idx_reports_target" ON "reports" ("target_type", "target_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_deliverable_data_records_unique" ON "deliverable_data_records" ("deliverable_id", "collection", "record_id");
CREATE INDEX IF NOT EXISTS "idx_deliverable_data_records_collection" ON "deliverable_data_records" ("deliverable_id", "collection");