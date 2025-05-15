CREATE INDEX "otp_email_idx" ON "otp" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_otp_idx" ON "otp" USING btree ("otp");--> statement-breakpoint
CREATE INDEX "users_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");