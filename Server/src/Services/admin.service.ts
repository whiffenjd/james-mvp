import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { UsersTable, funds } from '../db/schema';
import bcrypt from 'bcryptjs';

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
      investorCount: sql`COALESCE(SUM(jsonb_array_length(${funds.investors})::integer), 0)`,
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
  const [user] = await db
    .select({ id: UsersTable.id, role: UsersTable.role })
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  if (!user) {
    throw new Error('Fund manager not found');
  }
  if (user.role !== 'fundManager') {
    throw new Error('User is not a fund manager');
  }

  await db
    .update(UsersTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(UsersTable.id, userId));
};

export const getInvestors = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const baseQuery = db
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email,
      created_at: UsersTable.createdAt,
      projectCount: sql`COUNT(DISTINCT ${funds.id})::integer`,
      investorCount: sql`COALESCE(SUM(jsonb_array_length(${funds.investors})::integer), 0)`,
    })
    .from(UsersTable)
    .leftJoin(
      funds,
      sql`${UsersTable.id}::text IN (
        SELECT elem->>'investorId'
        FROM jsonb_array_elements(${funds.investors}) AS elem
      )`,
    )
    .where(and(eq(UsersTable.role, 'investor'), eq(UsersTable.isActive, true)))
    .groupBy(UsersTable.id);

  const [data, [{ count }]] = await Promise.all([
    baseQuery.limit(limit).offset(offset),
    db
      .select({ count: sql`count(*)::integer` })
      .from(UsersTable)
      .where(and(eq(UsersTable.role, 'investor'), eq(UsersTable.isActive, true))),
  ]);

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { data, totalItems, totalPages };
};

export const deleteInvestor = async (userId: string) => {
  const [user] = await db
    .select({ id: UsersTable.id, role: UsersTable.role })
    .from(UsersTable)
    .where(eq(UsersTable.id, userId));

  if (!user) {
    throw new Error('Investor not found');
  }
  if (user.role !== 'investor') {
    throw new Error('User is not an investor');
  }

  await db
    .update(UsersTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(UsersTable.id, userId));
};
