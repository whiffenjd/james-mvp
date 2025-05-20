import { desc, eq, lt, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateOTP } from '../Utils/Otp';
import { OtpTable, UsersTable } from '../db/schema';
import { db } from '../db/DbConnection';
import { transporter } from '../configs/Nodemailer';
import { otpTemplate } from '../Utils/OtpEmailVerifyTemplate';
import { signToken } from './jwtService';
import { deleteOldOtps } from '../Utils/DeleteOldOtps';
import cache, { deleteCache, getCache, setCache, User } from '../Utils/Caching';
import type { Role } from '../Utils/Caching';
import { UserTokens } from '../db/schema/UserTokens';
import { deleteUserTokenByType } from '../Utils/DeleteTokenByType';

export const registerInvestor = async (name: string, email: string, password: string) => {
  // Step 1: Check if user already exists
  const existingUser = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  // Step 2: Continue with registration
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
    role: 'investor',
    isEmailVerified: false,
    isActive: true,
  });

  deleteCache('allUsers');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Investment Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: otpTemplate(otp, name),
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }

  return {
    success: true,
    message: 'OTP sent to email',
  };
};
export const loginUser = async (
  email: string,
  password: string,
  role: 'admin' | 'fundManager' | 'investor',
) => {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new Error('Email not verified');
  }

  await deleteUserTokenByType(user.id, email, 'userAuth');

  // Sign and store new token
  const { token, expiresAt } = signToken({ id: user.id, role: user.role });
  await db.insert(UserTokens).values({
    userId: user.id,
    email: user.email,
    token,
    expiresAt,
    type: 'userAuth',
    userRole: user.role,
  });
  deleteCache(`userProfile:${user.id}`);
  return { token, user };
};

export const getUserProfileByRole = async (id: string, role: Role): Promise<User | null> => {
  const [user] = await db.select().from(UsersTable).where(eq(UsersTable.id, id));

  return user ? { ...user, role: user.role as Role } : null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const cacheKey = 'allUsers';
  const cachedUsers = getCache<User[]>(cacheKey);

  if (cachedUsers) {
    return cachedUsers;
  }

  const users = await db.select().from(UsersTable);

  const typedUsers = users.map((user) => ({
    ...user,
    role: user.role as Role,
  }));
  setCache(cacheKey, typedUsers);
  return typedUsers;
};
