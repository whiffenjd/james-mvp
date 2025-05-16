import { desc, eq } from "drizzle-orm";
import { generateOTP } from "../Utils/Otp";
import { OtpTable, UsersTable } from "../db/schema";
import { db } from "../db/DbConnection";
import { transporter } from "../configs/Nodemailer";
import { otpTemplate } from "../Utils/OtpEmailVerifyTemplate";
import { deleteOldOtps } from "../Utils/DeleteOldOtps";
import cache, { deleteCache } from "../Utils/Caching";
export const verifyInvestorOtp = async (email: string, otp: string) => {
  const [storedOtp] = await db
    .select()
    .from(OtpTable)
    .where(eq(OtpTable.email, email))
    .orderBy(desc(OtpTable.createdAt))
    .limit(1);
  if (
    !storedOtp ||
    storedOtp.isUsed ||
    new Date() > new Date(storedOtp.expiresAt) ||
    storedOtp.otp.trim() !== otp.trim()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // Mark OTP as used
  await db
    .update(OtpTable)
    .set({ isUsed: true, verifiedAt: new Date() })
    .where(eq(OtpTable.id, storedOtp.id));

  await db
    .update(UsersTable)
    .set({ isEmailVerified: true })
    .where(eq(UsersTable.email, email));

  deleteCache(`allUsers`);
  await deleteOldOtps(email);

  return { message: "Email verified successfully" };
};
export const resendInvestorOtp = async (email: string) => {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.email, email),
  });

  if (!user) throw new Error("User not found");
  if (user.isEmailVerified) throw new Error("Email already verified");

  await deleteOldOtps(email);

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(OtpTable).values({
    email,
    otp,
    expiresAt,
    isUsed: false,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Resend OTP - Verify your email",
    html: otpTemplate(otp, user.name),
  });

  return { message: "OTP resent to email" };
};
