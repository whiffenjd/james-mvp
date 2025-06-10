ALTER TABLE "users" ADD COLUMN "is_onboarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;