ALTER TABLE "users" DROP CONSTRAINT "users_referral_users_id_fk";
--> statement-breakpoint
DROP INDEX "users_referral_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral" SET DEFAULT '';