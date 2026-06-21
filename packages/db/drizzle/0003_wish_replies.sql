CREATE TABLE IF NOT EXISTS "wish_replies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "wish_id" uuid NOT NULL REFERENCES "wishes"("id") ON DELETE CASCADE,
  "author_id" uuid NOT NULL REFERENCES "users"("id"),
  "body" text NOT NULL,
  "nickname" varchar(50),
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wish_replies_wish_created"
  ON "wish_replies" ("wish_id", "created_at");