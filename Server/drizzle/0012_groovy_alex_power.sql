ALTER TABLE "users" ALTER COLUMN "referral" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subdomain" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_users_id_fk" FOREIGN KEY ("referral") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_subdomain_idx" ON "users" USING btree ("subdomain");--> statement-breakpoint
CREATE INDEX "users_referral_idx" ON "users" USING btree ("referral");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_subdomain_unique" UNIQUE("subdomain");