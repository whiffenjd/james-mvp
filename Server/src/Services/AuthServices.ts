import { desc, eq, lt, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/Otp";
import { OtpTable, UsersTable } from "../db/schema";
import { db } from "../db/DbConnection";
import { transporter } from "../configs/Nodemailer";
import { otpTemplate } from "../Utils/OtpEmailVerifyTemplate";
import { signToken } from "./jwtService";
import { Role } from "../Types/User";
import { deleteOldOtps } from "../Utils/DeleteOldOtps";
import cache from "../Utils/Caching";
import { UserTokens } from "../db/schema/UserTokens";

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
  // Invalidate caches related to users
  cache.del("allUsers"); // Remove cached all users list
  cache.del(`userProfile`); // Optional: if caching by email, else by id
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

  // Delete old token
  await db.delete(UserTokens).where(eq(UserTokens.userId, user.id));

  // Sign and store new token
  const token = signToken({ id: user.id, role: user.role });
  await db.insert(UserTokens).values({
    userId: user.id,
    email: user.email,
    token,
  });

  return { token, user };
};

export const getUserProfileByRole = async (id: string, role: Role) => {
  const [user] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, id));
  return user || null;
};
export const getAllUsers = async () => {
  // Check if users are cached
  const cachedUsers = cache.get("allUsers");

  if (cachedUsers) {
    return cachedUsers as (typeof UsersTable)[];
  }

  // Fetch from DB and cache result
  const users = await db.select().from(UsersTable);
  cache.set("allUsers", users);
  return users;
};
