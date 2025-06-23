import { desc, eq, lt, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { InvestorOnboardingTable, OtpTable, themes, UsersTable } from '../db/schema';
import { db } from '../db/DbConnection';
import { transporter } from '../configs/Nodemailer';
import { signToken } from './jwtService';
import { UserTokens } from '../db/schema/UserTokens';
import { generateOTP } from '../Utils/Otp';
import { deleteOldOtps } from '../Utils/DeleteOldOtps';
import { deleteCache, getCache, setCache } from '../Utils/Caching';
import { otpTemplate } from '../Utils/OtpEmailVerifyTemplate';
import { deleteUserTokenByType } from '../Utils/DeleteTokenByType';
import { Role, User } from '../Types/User';

export const registerInvestor = async (
  name: string,
  email: string,
  password: string,
  referralId: string,
) => {
  // Step 1: Check if user already exists
  const existingUser = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('An account with this email already exists.');
  }
  console.log('referralID', referralId);
  // Step 2: If referralId is provided, fetch their theme
  let selectedThemeId: string | null = null;
  if (referralId) {
    const referralTheme = await db
      .select()
      .from(themes)
      .where(eq(themes.userId, referralId))
      .limit(1);

    if (referralTheme.length > 0) {
      selectedThemeId = referralTheme[0].id;
    }
  }

  // Step 3: Continue with registration
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
    referral: referralId,
    isActive: true,
    selectedTheme: selectedThemeId, // <-- Set the selected theme id here
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

  // If user is an investor, fetch onboarding status
  let onboardingStatus = null;
  if (user.role === 'investor') {
    const onboarding = await db.query.InvestorOnboardingTable.findFirst({
      where: eq(InvestorOnboardingTable.userId, user.id),
      columns: {
        status: true,
        rejectionNote: true,
      },
    });
    if (onboarding) {
      onboardingStatus = {
        status: onboarding.status,
        rejectionNote: onboarding.rejectionNote,
      };
    }
  }

  const { password: _password, ...userWithoutPassword } = user;

  // Add onboardingStatus if applicable
  const userWithOnboarding = {
    ...userWithoutPassword,
    onboardingStatus,
  };

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
  await db
    .update(UsersTable)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(UsersTable.id, user.id));
  deleteCache(`userProfile:${user.id}`);

  return {
    token,
    user: userWithOnboarding,
  };
};

// export const loginUser = async (
//   email: string,
//   password: string,
//   role: 'admin' | 'fundManager' | 'investor',
// ) => {
//   const user = await db.query.UsersTable.findFirst({
//     where: eq(UsersTable.email, email),
//   });

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     throw new Error('Invalid credentials');
//   }

//   if (!user.isEmailVerified) {
//     throw new Error('Email not verified');
//   }

//   await deleteUserTokenByType(user.id, email, 'userAuth');

//   // Sign and store new token
//   const { token, expiresAt } = signToken({ id: user.id, role: user.role });
//   await db.insert(UserTokens).values({
//     userId: user.id,
//     email: user.email,
//     token,
//     expiresAt,
//     type: 'userAuth',
//     userRole: user.role,
//   });
//   deleteCache(`userProfile:${user.id}`);
//   return { token, user };
// };

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
