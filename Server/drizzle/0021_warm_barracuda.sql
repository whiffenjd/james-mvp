CREATE TABLE "tax_report_investors" (
	"tax_report_id" uuid NOT NULL,
	"investor_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tax_report_investors" ADD CONSTRAINT "tax_report_investors_tax_report_id_tax_reports_id_fk" FOREIGN KEY ("tax_report_id") REFERENCES "public"."tax_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_report_investors" ADD CONSTRAINT "tax_report_investors_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;