ALTER TABLE "user_tokens" ADD COLUMN "type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD COLUMN "user_role" varchar(50) NOT NULL;--> statement-breakpoint
CREATE INDEX "user_tokens_token_idx" ON "user_tokens" USING btree ("token");