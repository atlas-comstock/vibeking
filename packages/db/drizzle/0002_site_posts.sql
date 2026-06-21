DO $$ BEGIN
  CREATE TYPE "site_post_source" AS ENUM('here_now', 'hosted', 'url');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "site_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "slug" varchar(64),
  "site_url" varchar(2000) NOT NULL,
  "title" varchar(200) NOT NULL,
  "description" text,
  "cover_emoji" varchar(8) DEFAULT '✨',
  "tags" text[] DEFAULT '{}' NOT NULL,
  "source" "site_post_source" DEFAULT 'here_now' NOT NULL,
  "like_count" integer DEFAULT 0 NOT NULL,
  "view_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_site_posts_created" ON "site_posts" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_site_posts_source" ON "site_posts" ("source");