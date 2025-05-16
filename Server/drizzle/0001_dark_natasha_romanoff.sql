CREATE TABLE "otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
