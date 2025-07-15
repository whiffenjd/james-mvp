CREATE TABLE "fund_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"project_name" text NOT NULL,
	"description" text NOT NULL,
	"document_url" text NOT NULL,
	"year" text NOT NULL,
	"quarter" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fund_reports" ADD CONSTRAINT "fund_reports_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_reports" ADD CONSTRAINT "fund_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;