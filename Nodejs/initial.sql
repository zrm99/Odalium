CREATE TABLE "t_miniverses" (
  "name" text,
  "summary" text,
  "date" timestamptz,
  "follower_count" bigint,
  "follower_names" text [],
  "creator" text,
  "moderators" text [],
  "encoded_uri" text,
  "miniverse_type" text
);

CREATE TABLE "t_replies" (
  "reply_content" text,
  "creator" text,
  "creation_date" timestamptz,
  "miniverse" text,
  "reply_id" bigint,
  "topic_id" bigint
);

CREATE TABLE "t_topics" (
  "title" text,
  "descriptor" text,
  "creator" text,
  "miniverse" text,
  "creation_date" timestamptz,
  "topic_id" bigint
);

CREATE TABLE "t_users" (
  "username" text,
  "password_hash" text,
  "date_created" timestamptz,
  "ip_address" text,
  "profile_data" text,
  "following_names" text [],
  "follower_names" text [],
  "follower_count" bigint,
  "bio" text DEFAULT('no bio'),
  "role" text
);


CREATE TABLE "t_profile_posts" (
  "username" text,
  "date_created" text,
  "profile_post_content" text,
  "post_id" bigint
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)

WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
