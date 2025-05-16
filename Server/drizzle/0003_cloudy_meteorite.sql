CREATE TABLE "user_tokens" (
	"user_id" uuid NOT NULL,
	"email" varchar(512) NOT NULL,
	"token" varchar(512) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "user_tokens_user_id_idx" ON "user_tokens" USING btree ("user_id");