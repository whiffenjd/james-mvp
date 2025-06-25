ALTER TABLE "funds" ALTER COLUMN "fund_size" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "funds" ALTER COLUMN "target_moic" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "funds" ALTER COLUMN "target_irr" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "funds" ALTER COLUMN "minimum_investment" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "funds" ADD COLUMN "fund_manager_id" text NOT NULL;