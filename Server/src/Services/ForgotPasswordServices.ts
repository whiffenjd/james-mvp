import { UsersTable, UserTokens } from "../db/schema";
import { and, eq } from "drizzle-orm";

import bcrypt from "bcryptjs";
import { db } from "../db/DbConnection";
import { generateResetToken, verifyResetToken } from "./jwtService";
import { sendResetPasswordEmail } from "../Utils/PasswordResetEmail";
import { deleteUserTokenByType } from "../Utils/DeleteTokenByType";

export const requestPasswordReset = async (email: string) => {
  const user = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));

  if (!user.length) throw new Error("User not found");

  const foundUser = user[0];
  const token = generateResetToken(email);
  const expiresAt = addMinutes(new Date(), 15); // Token expires in 15 minutes

  // ⛔ Delete old reset tokens for this user (email + type + role)
  await deleteUserTokenByType(foundUser.id, email, "reset_password");

  // ✅ Insert new token
  await db.insert(UserTokens).values({
    userId: foundUser.id,
    email,
    token,
    type: "reset_password",
    expiresAt,
    userRole: foundUser.role,
  });

  // ✉️ Send email
  await sendResetPasswordEmail(email, token, foundUser.name);

  return { token, message: "Reset link sent" };
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  const decoded = verifyResetToken(token);
  if (decoded.email !== email) throw new Error("Invalid token");

  // 🔍 Get user by email to find userId
  const user = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));

  if (!user.length) throw new Error("User not found");
  const userId = user[0].id;

  // ✅ Check if token is valid, unexpired, and matches DB
  const tokenRecord = await db.query.UserTokens.findFirst({
    where: (t, { and, eq, gt }) =>
      and(
        eq(t.token, token),
        eq(t.email, email),
        eq(t.type, "reset_password"),
        eq(t.userId, userId),
        gt(t.expiresAt, new Date())
      ),
  });

  if (!tokenRecord) throw new Error("Token expired or invalid");

  // 🔐 Hash new password and update
  const hashed = await bcrypt.hash(newPassword, 10);
  await db
    .update(UsersTable)
    .set({ password: hashed })
    .where(eq(UsersTable.email, email));

  // 🧹 Delete all reset_password tokens for this user
  await deleteUserTokenByType(userId, email, "reset_password");

  return { message: "Password updated" };
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
