import { eq } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { FundCreateRequest } from '../Types/FundTypes';
import { funds } from '../db/schema/Funds';
import { UsersTable } from '../db/schema';
import deleteS3Keys, { extractKeyFromUrl } from './DeleteS3Keys';

export default class FundService {
  static async create(data: FundCreateRequest) {
    const [inserted] = await db.insert(funds).values(data).returning();
    return inserted;
  }

  static async getAll() {
    return db.select().from(funds);
  }
  static async getSpecific() {
    const allFunds = await db.select().from(funds);

    // Map to return only desired fields + investor count
    return allFunds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      fundType: fund.fundType,
      fundDescription: fund.fundDescription,
      investorCount: fund.investors?.length || 0,
      createdAt: fund.createdAt,
    }));
  }

  static async getById(id: string) {
    const result = await db.select().from(funds).where(eq(funds.id, id)).limit(1);
    return result[0] || null;
  }

  static async getByManagerId(managerId: string) {
    // Assuming you later add managerId field in schema
    return db.select().from(funds).where(eq(funds.id, managerId));
  }

  static async update(id: string, data: Partial<FundCreateRequest>) {
    const [updated] = await db.update(funds).set(data).where(eq(funds.id, id)).returning();
    return updated;
  }
  static async findById(id: string) {
    const result = await db.select().from(funds).where(eq(funds.id, id)).limit(1);
    return result[0] || null;
  }
  static async getInvestorsByFundManager(fundManagerId: string) {
    return db
      .select({
        id: UsersTable.id,
        email: UsersTable.email,
        name: UsersTable.name,
        role: UsersTable.role,
        isEmailVerified: UsersTable.isEmailVerified,
      })
      .from(UsersTable)
      .where(eq(UsersTable.referral, fundManagerId));
  }
  static async delete(id: string) {
    // 1. Get the fund
    const fund = await db.query.funds.findFirst({
      where: (funds, { eq }) => eq(funds.id, id),
    });

    if (!fund) throw new Error('Fund not found');

    // 2. Collect all S3 URLs from fund.documents and fund.investors
    const documents = fund.documents || [];
    const investors = fund.investors || [];

    const documentUrls = documents.map((doc) => doc.fileUrl);
    const investorDocUrls = investors.map((inv) => inv.documentUrl);

    // 3. Extract keys from URLs
    const allKeys = [...documentUrls, ...investorDocUrls].filter(Boolean).map(extractKeyFromUrl);

    // 4. Delete files from S3
    await deleteS3Keys(allKeys);

    // 5. Delete the fund
    await db.delete(funds).where(eq(funds.id, id));

    return { message: 'Fund and associated documents deleted successfully' };
  }
}
