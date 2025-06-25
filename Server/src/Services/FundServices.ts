import { eq } from 'drizzle-orm';
import { db } from '../db/DbConnection';

import { funds } from '../db/schema/Funds';
import { UsersTable } from '../db/schema';
import deleteS3Keys, { extractKeyFromUrl } from './DeleteS3Keys';
import { FundCreateRequest } from '../Utils/FundCreationUpdatehelper';

export default class FundService {
  static async create(data: FundCreateRequest) {
    try {
      const [insertedFund] = await db.insert(funds).values(data).returning();

      return insertedFund;
    } catch (error) {
      console.error('FundService.create Error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to create fund: ${error.message}`
          : 'Unknown error occurred while creating fund',
      );
    }
  }

  static async getAll() {
    return db.select().from(funds);
  }
  static async getSpecific(fundManagerId: string) {
    const allFunds = await db.select().from(funds).where(eq(funds.fundManagerId, fundManagerId)); // ✅ Filter funds

    return allFunds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      fundType: fund.fundType,
      fundDescription: fund.fundDescription,
      investorCount: Array.isArray(fund.investors) ? fund.investors.length : 0,
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
    try {
      const [updatedFund] = await db.update(funds).set(data).where(eq(funds.id, id)).returning();

      return updatedFund;
    } catch (error) {
      console.error('FundService.update Error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to update fund: ${error.message}`
          : 'Unknown error occurred while updating fund',
      );
    }
  }
  static async findByIdFund(id: string) {
    try {
      const [fund] = await db.select().from(funds).where(eq(funds.id, id)).limit(1);

      return fund || null;
    } catch (error) {
      console.error('FundService.findById Error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to find fund: ${error.message}`
          : 'Unknown error occurred while finding fund',
      );
    }
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
    const documents = Array.isArray(fund.documents) ? fund.documents : [];
    const investors = Array.isArray(fund.investors) ? fund.investors : [];

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
  // FundService.ts
  static async getAllFundsForInvestor(investorId: string): Promise<any[]> {
    const result = await db.select().from(funds);

    const matchingFunds = result.filter((fund) =>
      (Array.isArray(fund.investors) ? fund.investors : []).some(
        (inv: any) => inv.investorId === investorId,
      ),
    );

    return matchingFunds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      fundType: fund.fundType,
      fundDescription: fund.fundDescription,
      investorCount: Array.isArray(fund.investors) ? fund.investors.length : 0,
      createdAt: fund.createdAt,
    }));
  }
}
