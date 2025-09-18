CREATE TYPE "public"."quarter" AS ENUM('Quarter1', 'Quarter2', 'Quarter3', 'Quarter4');--> statement-breakpoint
CREATE TABLE "tax_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" text NOT NULL,
	"report_url" text NOT NULL,
	"created_by" uuid NOT NULL,
	"year" text NOT NULL,
	"quarter" "quarter" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tax_reports" ADD CONSTRAINT "tax_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;