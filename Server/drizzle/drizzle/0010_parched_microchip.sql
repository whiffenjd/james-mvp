CREATE TABLE "investor_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"rejection_note" varchar(1024),
	"current_step" varchar(50),
	"form_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onboarding_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"file_url" varchar(1024) NOT NULL,
	"file_name" varchar(255),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "investor_onboarding" ADD CONSTRAINT "investor_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_documents" ADD CONSTRAINT "onboarding_documents_onboarding_id_investor_onboarding_id_fk" FOREIGN KEY ("onboarding_id") REFERENCES "public"."investor_onboarding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "investor_onboarding_user_id_idx" ON "investor_onboarding" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "onboarding_documents_onboarding_id_idx" ON "onboarding_documents" USING btree ("onboarding_id");