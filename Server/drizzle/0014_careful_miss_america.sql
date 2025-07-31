ALTER TABLE "users" ALTER COLUMN "referral" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_users_id_fk" FOREIGN KEY ("referral") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_referral_idx" ON "users" USING btree ("referral");