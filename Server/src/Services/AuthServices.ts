import { desc, eq, lt, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/Otp";
import { OtpTable, UsersTable } from "../db/schema";
import { db } from "../db/DbConnection";
import { transporter } from "../configs/Nodemailer";
import { otpTemplate } from "../Utils/OtpEmailVerifyTemplate";
import { signToken } from "./jwtService";
import { Role } from "../Types/User";

const deleteOldOtps = async (email: string) => {
  const now = new Date();

  await db
    .delete(OtpTable)
    .where(
      or(
        eq(OtpTable.email, email),
        lt(OtpTable.expiresAt, now),
        eq(OtpTable.isUsed, true)
      )
    );
};

export const registerInvestor = async (
  name: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await deleteOldOtps(email);

  await db.insert(OtpTable).values({
    email,
    otp,
    expiresAt,
    isUsed: false,
  });

  await db.insert(UsersTable).values({
    name,
    email,
    password: hashedPassword,
    role: "investor",
    isEmailVerified: false,
    isActive: true,
  });

  try {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Investment Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      html: otpTemplate(otp, name),
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }

  return { message: "OTP sent to email" };
};

export const verifyInvestorOtp = async (email: string, otp: string) => {
  const [storedOtp] = await db
    .select()
    .from(OtpTable)
    .where(eq(OtpTable.email, email))
    .orderBy(desc(OtpTable.createdAt))
    .limit(1);
  console.log("Stored OTP:", storedOtp, otp);
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
  console.log("User after 4:");
  await db
    .update(UsersTable)
    .set({ isEmailVerified: true })
    .where(eq(UsersTable.email, email));
  console.log("User after 5:");
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.email, email),
  });
  console.log("User after verification:", user);

  return { user };
};

export const loginUser = async (
  email: string,
  password: string,
  role: "admin" | "fundManager" | "investor"
) => {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new Error("Email not verified");
  }

  const token = signToken({ id: user.id, role: user.role });
  return { token, user };
};

export const getUserProfileByRole = async (id: string, role: Role) => {
  const [user] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, id));
  return user || null;
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
