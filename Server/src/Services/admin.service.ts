import jwt from 'jsonwebtoken';
import { eq, and, sql, inArray, or } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import {
  InvestorOnboardingTable,
  UserTokens,
  UsersTable,
  capitalCalls,
  distributions,
  fundReports,
  funds,
} from '../db/schema';
import bcrypt from 'bcryptjs';
import { deleteUserTokenByType } from '../Utils/DeleteTokenByType';
import { signToken } from './jwtService';
import { deleteCache } from '../Utils/Caching';
import { JwtPayload } from '../Middlewares/VerifyToken';

export const checkSubdomain = async (subdomain: string) => {
  // Validate subdomain format (DNS-compliant: lowercase letters, numbers, hyphens, 1-63 chars)
  const regex = /^[a-z0-9-]{1,63}$/;
  const reserved = ['www', 'api', 'admin', 'mail'];
  if (!regex.test(subdomain) || reserved.includes(subdomain.toLowerCase())) {
    throw new Error('Invalid subdomain format or reserved word');
  }

  const [existing] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.subdomain, subdomain.toLowerCase()))
    .limit(1);

  return !existing; // true if available, false if taken
};

export const createFundManager = async (input: {
  name: string;
  email: string;
  password: string;
  subdomain: string;
}) => {
  // Validate inputs
  if (!input.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  const regex = /^[a-z0-9-]{1,63}$/;
  const reserved = ['www', 'api', 'admin', 'mail'];
  if (!regex.test(input.subdomain) || reserved.includes(input.subdomain.toLowerCase())) {
    throw new Error('Invalid subdomain format or reserved word');
  }

  // Check if email or subdomain is taken
  const [existingEmail] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.email, input.email.toLowerCase()))
    .limit(1);

  if (existingEmail) {
    throw new Error('Email already in use');
  }

  const [existingSubdomain] = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(eq(UsersTable.subdomain, input.subdomain.toLowerCase()))
    .limit(1);

  if (existingSubdomain) {
    throw new Error('Subdomain already taken');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Insert fund manager
  const [fundManager] = await db
    .insert(UsersTable)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: 'fundManager',
      subdomain: input.subdomain.toLowerCase(),
      isActive: true,
      isEmailVerified: false,
      isOnboarded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
      subdomain: UsersTable.subdomain,
      createdAt: UsersTable.createdAt,
    });

  return fundManager;
};
export const getFundManagers = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const baseQuery = db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
      created_at: UsersTable.createdAt,
      projectCount: sql`COUNT(DISTINCT ${funds.id})::integer`,
      investorCount: sql`(SELECT COUNT(*)::integer FROM ${UsersTable} AS investors WHERE investors.referral = ${UsersTable.id} AND investors.role = 'investor')`,
      subdomain: UsersTable.subdomain,
    })
    .from(UsersTable)
    .leftJoin(funds, eq(funds.fundManagerId, sql`${UsersTable.id}::text`))
    .where(and(eq(UsersTable.role, 'fundManager'), eq(UsersTable.isActive, true)))
    .groupBy(UsersTable.id);

  const [data, [{ count }]] = await Promise.all([
    baseQuery.limit(limit).offset(offset),
    db
      .select({ count: sql`count(*)::integer` })
      .from(UsersTable)
      .where(and(eq(UsersTable.role, 'fundManager'), eq(UsersTable.isActive, true))),
  ]);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { data, totalItems, totalPages };
};

export const deleteFundManager = async (userId: string) => {
  // Start a transaction
  await db.transaction(async (tx) => {
    // Verify the fund manager
    const [user] = await tx
      .select({ id: UsersTable.id, role: UsersTable.role })
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));

    if (!user) {
      throw new Error('Fund manager not found');
    }
    if (user.role !== 'fundManager') {
      throw new Error('User is not a fund manager');
    }

    // Find all investors with this fund manager as referral
    const investors = await tx
      .select({ id: UsersTable.id })
      .from(UsersTable)
      .where(and(eq(UsersTable.referral, userId), eq(UsersTable.role, 'investor')));

    const investorIds = investors.map((inv) => inv.id);

    // Find all funds managed by this fund manager
    const fundRecords = await tx
      .select({ id: funds.id })
      .from(funds)
      .where(eq(funds.fundManagerId, userId));

    const fundIds = fundRecords.map((fund) => fund.id);

    // Delete related records
    if (fundIds.length > 0) {
      // Delete capital calls for these funds or created by the fund manager
      await tx
        .delete(capitalCalls)
        .where(
          or(
            inArray(capitalCalls.fundId, fundIds),
            inArray(capitalCalls.investorId, investorIds),
            eq(capitalCalls.createdBy, userId),
          ),
        );

      // Delete distributions for these funds or created by the fund manager
      await tx
        .delete(distributions)
        .where(
          or(
            inArray(distributions.fundId, fundIds),
            inArray(distributions.investorId, investorIds),
            eq(distributions.createdBy, userId),
          ),
        );

      // Delete fund reports for these funds or created by the fund manager
      await tx
        .delete(fundReports)
        .where(or(inArray(fundReports.fundId, fundIds), eq(fundReports.createdBy, userId)));

      // Delete funds
      await tx.delete(funds).where(eq(funds.fundManagerId, userId));
    }

    // Delete investor onboarding records
    if (investorIds.length > 0) {
      await tx
        .delete(InvestorOnboardingTable)
        .where(inArray(InvestorOnboardingTable.userId, investorIds));
    }

    // Delete user tokens for the fund manager and associated investors
    const allUserIds = [userId, ...investorIds];
    if (allUserIds.length > 0) {
      await tx.delete(UserTokens).where(inArray(UserTokens.userId, allUserIds));
    }

    // Delete investors
    if (investorIds.length > 0) {
      await tx.delete(UsersTable).where(inArray(UsersTable.id, investorIds));
    }

    // Delete the fund manager
    await tx.delete(UsersTable).where(eq(UsersTable.id, userId));

    // Clear cache for all deleted users
    for (const id of allUserIds) {
      await deleteCache(`userProfile:${id}`);
    }
  });
};

export const getInvestors = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  // First get all investors with their referral IDs
  const investorsWithReferrals = await db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
      created_at: UsersTable.createdAt,
      referralId: UsersTable.referral, // Make sure this is the correct column name
    })
    .from(UsersTable)
    .where(and(eq(UsersTable.role, 'investor'), eq(UsersTable.isActive, true)))
    .limit(limit)
    .offset(offset);

  // Get all unique referral IDs
  const referralIds = investorsWithReferrals
    .map((investor) => investor.referralId)
    .filter(Boolean) as string[]; // Remove null/undefined and type assert

  // Fetch subdomains for these referrals in one query
  const referrals =
    referralIds.length > 0
      ? await db
          .select({
            id: UsersTable.id,
            subdomain: UsersTable.subdomain,
          })
          .from(UsersTable)
          .where(inArray(UsersTable.id, referralIds))
      : [];

  // Create a map of referralId -> subdomain for quick lookup
  const referralMap = new Map(referrals.map((ref) => [ref.id, ref.subdomain]));

  // Now get the counts and join with funds
  const investorsWithCounts = await Promise.all(
    investorsWithReferrals.map(async (investor) => {
      // Count related projects
      const projectCounts = await db
        .select({
          projectCount: sql`COUNT(DISTINCT ${funds.id})::integer`.as('projectCount'),
        })
        .from(funds).where(sql`${investor.id}::text IN (
        SELECT elem->>'investorId'
        FROM jsonb_array_elements(${funds.investors}) AS elem
      )`);

      // Count investors sharing the same referral (fund manager)
      const referredInvestorCountResult = await db
        .select({ investorCount: sql`COUNT(*)::integer` })
        .from(UsersTable)
        .where(
          and(
            eq(UsersTable.role, 'investor'),
            eq(UsersTable.isActive, true),
            eq(UsersTable.referral, investor.referralId),
          ),
        );

      return {
        ...investor,
        projectCount: projectCounts[0]?.projectCount || 0,
        investorCount: referredInvestorCountResult[0]?.investorCount || 0,
        subdomain: investor.referralId ? referralMap.get(investor.referralId) : null,
      };
    }),
  );

  // Get total count
  const [{ count }] = await db
    .select({ count: sql`count(*)::integer` })
    .from(UsersTable)
    .where(and(eq(UsersTable.role, 'investor'), eq(UsersTable.isActive, true)));

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: investorsWithCounts,
    totalItems,
    totalPages,
  };
};

export const deleteInvestor = async (userId: string) => {
  // Start a transaction
  await db.transaction(async (tx) => {
    // Verify the investor
    const [user] = await tx
      .select({ id: UsersTable.id, role: UsersTable.role })
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));

    if (!user) {
      throw new Error('Investor not found');
    }
    if (user.role !== 'investor') {
      throw new Error('User is not an investor');
    }

    // Delete capital calls for this investor
    await tx.delete(capitalCalls).where(eq(capitalCalls.investorId, userId));

    // Delete distributions for this investor
    await tx.delete(distributions).where(eq(distributions.investorId, userId));

    // Remove investor from funds.investors JSONB array
    await tx
      .update(funds)
      .set({
        investors: sql`(
      SELECT jsonb_agg(elem)
      FROM jsonb_array_elements(${funds.investors}) AS elem
      WHERE elem->>'investorId' != ${userId}
    )`,
      })
      .where(
        sql`${userId}::text IN (
      SELECT elem->>'investorId'
      FROM jsonb_array_elements(${funds.investors}) AS elem
    )`,
      );

    // Delete investor onboarding records
    await tx.delete(InvestorOnboardingTable).where(eq(InvestorOnboardingTable.userId, userId));

    // Delete user tokens for the investor
    await tx.delete(UserTokens).where(eq(UserTokens.userId, userId));

    // Delete the investor
    await tx.delete(UsersTable).where(eq(UsersTable.id, userId));

    // Clear cache for the investor
    deleteCache(`userProfile:${userId}`);
  });
};
export const loginAsUser = async (targetUserId: string, token: string, req: any) => {
  // Decode and validate admin token
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid admin token');
  }

  const [storedToken] = await db
    .select()
    .from(UserTokens)
    .where(
      and(
        eq(UserTokens.userId, decoded.id),
        eq(UserTokens.userRole, 'admin'),
        eq(UserTokens.type, 'userAuth'),
        sql`${UserTokens.expiresAt} > NOW()`,
      ),
    )
    .limit(1);

  if (!storedToken || storedToken.token !== token) {
    throw new Error('Session expired or logged out');
  }

  if (new Date() > new Date(storedToken.expiresAt)) {
    throw new Error('Token expired');
  }

  // Fetch target user
  const [targetUser] = await db
    .select()
    .from(UsersTable)
    .where(
      and(
        eq(UsersTable.id, targetUserId),
        inArray(UsersTable.role, ['fundManager', 'investor']),
        eq(UsersTable.isActive, true),
      ),
    )

    .limit(1);
  if (!targetUser) {
    throw new Error('Target user not found or invalid');
  }

  if (!targetUser.isEmailVerified) {
    throw new Error('Target user email not verified');
  }

  // Subdomain validation
  const origin = req.headers.origin || req.headers.referer || '';
  let subdomain = '';
  if (origin) {
    const url = new URL(origin);
    subdomain = url.hostname.split('.')[0].toLowerCase();
  }

  if (
    (targetUser.role === 'investor' && targetUser.referral) ||
    (targetUser.role === 'fundManager' && targetUser.subdomain)
  ) {
    if (!subdomain || ['www', 'mvp', 'localhost'].includes(subdomain)) {
      throw new Error(
        `${targetUser.role === 'investor' ? 'Investors' : 'Fund managers'} must log in via their assigned subdomain`,
      );
    }

    if (targetUser.role === 'investor') {
      const [fundManager] = await db
        .select({ id: UsersTable.id, subdomain: UsersTable.subdomain })
        .from(UsersTable)
        .where(and(eq(UsersTable.id, targetUser.referral), eq(UsersTable.role, 'fundManager')))
        .limit(1);
      if (!fundManager || fundManager.subdomain.toLowerCase() !== subdomain) {
        throw new Error("Investors can only log in via their fund manager's subdomain");
      }
    }

    if (targetUser.role === 'fundManager') {
      if (subdomain !== targetUser.subdomain.toLowerCase()) {
        throw new Error('Fund managers can only log in via their own subdomain');
      }
    }
  }

  // Fetch onboarding status for investors
  let onboardingStatus = null;
  if (targetUser.role === 'investor') {
    const [onboarding] = await db
      .select({
        status: InvestorOnboardingTable.status,
        rejectionNote: InvestorOnboardingTable.rejectionNote,
      })
      .from(InvestorOnboardingTable)
      .where(eq(InvestorOnboardingTable.userId, targetUser.id))
      .limit(1);
    if (onboarding) {
      onboardingStatus = {
        status: onboarding.status,
        rejectionNote: onboarding.rejectionNote,
      };
    }
  }

  // Generate new token for target user
  await deleteUserTokenByType(targetUser.id, targetUser.email, 'userAuth');
  const { token: newToken, expiresAt } = signToken({ id: targetUser.id, role: targetUser.role });
  await db.insert(UserTokens).values({
    userId: targetUser.id,
    email: targetUser.email,
    token: newToken,
    expiresAt,
    type: 'userAuth',
    userRole: targetUser.role,
  });

  // Update last login
  await db
    .update(UsersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(UsersTable.id, targetUser.id));
  deleteCache(`userProfile:${targetUser.id}`);

  const { password: _password, ...userWithoutPassword } = targetUser;
  const userWithOnboarding = {
    ...userWithoutPassword,
    onboardingStatus,
  };

  return { token: newToken, user: userWithOnboarding };
};
