CREATE TABLE "website_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"logo_url" varchar NOT NULL,
	"project_name" varchar NOT NULL,
	"project_description" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dashboard_background" varchar NOT NULL,
	"card_background" varchar NOT NULL,
	"primary_text" varchar NOT NULL,
	"secondary_text" varchar NOT NULL,
	"sidebar_accent_text" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
