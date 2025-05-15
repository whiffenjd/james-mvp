import { UsersTable } from "../db/schema";
import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";
import { db } from "../db/DbConnection";
import { generateResetToken, verifyResetToken } from "./jwtService";
import { sendResetPasswordEmail } from "../Utils/PasswordResetEmail";

export const requestPasswordReset = async (email: string) => {
  const user = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));
  if (!user.length) throw new Error("User not found");

  const token = generateResetToken(email);
  await sendResetPasswordEmail(email, token, user[0].name);
  return { token, message: "Reset link sent" };
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  const decoded = verifyResetToken(token);
  if (decoded.email !== email) throw new Error("Invalid token");

  const hashed = await bcrypt.hash(newPassword, 10);
  await db
    .update(UsersTable)
    .set({ password: hashed })
    .where(eq(UsersTable.email, email));
  return { message: "Password updated" };
};
