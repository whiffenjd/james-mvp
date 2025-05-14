import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if SMTP_FROM exists and format it properly
const fromAddress = process.env.SMTP_FROM || "";

// Validate that we have a proper from address format
if (!fromAddress.includes("@")) {
  console.warn(
    "WARNING: SMTP_FROM environment variable is missing or improperly formatted!"
  );
  console.warn(
    "Format should be 'Name <email@example.com>' or just 'email@example.com'"
  );
}

import SMTPTransport from "nodemailer/lib/smtp-transport";

export const transporter = nodemailer.createTransport(
  new SMTPTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Boolean(process.env.SMTP_SECURE === "true"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Note: Removed 'defaults' as it is not a valid property of SMTPTransport.Options
  })
);

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});
