ALTER TABLE "users" ADD COLUMN "selected_theme_id" uuid DEFAULT '';--> statement-breakpoint
CREATE INDEX "users_selected_theme_idx" ON "users" USING btree ("selected_theme_id");