CREATE TABLE "funds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"fund_size" text NOT NULL,
	"fund_type" text NOT NULL,
	"target_geographies" text NOT NULL,
	"target_sectors" text NOT NULL,
	"target_moic" text NOT NULL,
	"target_irr" text NOT NULL,
	"minimum_investment" text NOT NULL,
	"fund_lifetime" text NOT NULL,
	"fund_description" text,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"investors" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
