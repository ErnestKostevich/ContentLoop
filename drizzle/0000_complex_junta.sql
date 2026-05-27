CREATE TABLE "custom_formats" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"system_prompt" text NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_formats_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "history_entries" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_preview" text NOT NULL,
	"source_full" text NOT NULL,
	"formats" jsonb NOT NULL,
	"results" jsonb NOT NULL,
	"voice_profile_used" jsonb DEFAULT 'false'::jsonb NOT NULL,
	"voice_profile_name" text,
	CONSTRAINT "history_entries_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "pro_subscriptions" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"provider" text NOT NULL,
	"order_id" text,
	"status" text NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pro_subscriptions_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"active_profile_id" text,
	"byok_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_profiles" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"name" text NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"samples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voice_profiles_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE INDEX "cf_user_idx" ON "custom_formats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "he_user_idx" ON "history_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "he_created_idx" ON "history_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ps_user_idx" ON "pro_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ps_valid_until_idx" ON "pro_subscriptions" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "vp_user_idx" ON "voice_profiles" USING btree ("user_id");