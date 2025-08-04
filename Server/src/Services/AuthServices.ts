import { and, desc, eq, lt, or } from 'drizzle-orm';
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
import { CustomRequest } from '../Controllers/AuthUserController';

export const registerInvestor = async (
  req: CustomRequest,
  name: string,
  email: string,
  password: string,
  referralId?: string, // Optional manual referral ID for main domain
) => {
  // Step 1: Check if user already exists
  const [existingUser] = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email))
    .limit(1);

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }
  // Step 2: Determine referral ID
  let finalReferralId: string | null = null;
  if (req.fundManager) {
    // Subdomain signup: Use fund manager's ID
    finalReferralId = req.fundManager.id;
  } else if (referralId) {
    // Main domain signup: Validate provided referral ID
    const [referredFundManager] = await db
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(and(eq(UsersTable.id, referralId), eq(UsersTable.role, 'fundManager')))
      .limit(1);
    if (!referredFundManager) {
      throw new Error('Invalid referral ID');
    }
    finalReferralId = referralId;
  } else {
    // Main domain signup without referral ID
    throw new Error(
      'Signup is only allowed via a fund manager subdomain or with a valid referral ID',
    );
  }

  // Step 3: Fetch theme for referral ID
  let selectedThemeId: string | null = null;
  if (finalReferralId) {
    const [referralTheme] = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.userId, finalReferralId))
      .limit(1);
    selectedThemeId = referralTheme?.id || null;
  }

  // Step 4: Register investor
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
    referral: finalReferralId || '',
    isActive: true,
    selectedTheme: selectedThemeId,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  req: CustomRequest,
  email: string,
  password: string,
  role: 'admin' | 'fundManager' | 'investor',
) => {
  const [user] = await db.select().from(UsersTable).where(eq(UsersTable.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  // For investors, check subdomain matches their referral fund manager
  if (
    (user.role === 'investor' && user.referral) ||
    (user.role === 'fundManager' && user.subdomain)
  ) {
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    const url = new URL(origin || referer);
    const frontendHost = url.hostname;
    const subdomain = frontendHost.split('.')[0].toLowerCase();

    if (!subdomain || ['www', 'mvp', 'localhost'].includes(subdomain)) {
      throw new Error(
        `${user.role === 'investor' ? 'Investors' : 'Fund managers'} must log in via their assigned subdomain`,
      );
    }

    if (user.role === 'investor') {
      const [fundManager] = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(and(eq(UsersTable.subdomain, subdomain), eq(UsersTable.role, 'fundManager')))
        .limit(1);
      if (!fundManager || fundManager.id !== user.referral) {
        throw new Error("Investors can only log in via their fund manager's subdomain");
      }
    }

    if (user.role === 'fundManager') {
      if (subdomain !== user.subdomain.toLowerCase()) {
        throw new Error('Fund managers can only log in via their own subdomain');
      }
    }
  }
  //Check email verfication
  if (!user.isEmailVerified) {
    throw new Error('Email not verified');
  }

  await deleteUserTokenByType(user.id, email, 'userAuth');

  //check invsetor onboarding
  let onboardingStatus = null;
  if (user.role === 'investor') {
    const [onboarding] = await db
      .select({
        status: InvestorOnboardingTable.status,
        rejectionNote: InvestorOnboardingTable.rejectionNote,
      })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.userId, user.id))
      .limit(1);
    if (onboarding) {
      onboardingStatus = {
        status: onboarding.status,
        rejectionNote: onboarding.rejectionNote,
      };
    }
  }

  const { password: _password, ...userWithoutPassword } = user;

  const userWithOnboarding = {
    ...userWithoutPassword,
    onboardingStatus,
  };

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
