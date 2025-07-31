ALTER TABLE "users" DROP CONSTRAINT "users_referral_users_id_fk";
--> statement-breakpoint
DROP INDEX "users_referral_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "referral";