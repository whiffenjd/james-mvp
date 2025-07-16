import { and, eq, or, desc } from 'drizzle-orm';
import { db } from '../db/DbConnection';

import { funds } from '../db/schema/Funds';
import { activityLogs, capitalCalls, distributions, fundReports, UsersTable } from '../db/schema';
import deleteS3Keys, { extractKeyFromUrl } from './DeleteS3Keys';
import { FundCreateRequest } from '../Utils/FundCreationUpdatehelper';
import { formatDistanceToNow } from 'date-fns';

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
      fundSize: fund.fundSize,
      fundDescription: fund.fundDescription,
      investorCount: Array.isArray(fund.investors) ? fund.investors.length : 0,
      createdAt: fund.createdAt,
    }));
  }
  static async getById(id: string) {
    return db.transaction(async (tx) => {
      // Fetch fund details
      const fundResult = await tx.select().from(funds).where(eq(funds.id, id)).limit(1);
      if (!fundResult[0]) return null;

      const rawFund = fundResult[0];

      // Fetch activity logs related to this fund
      const logs = await tx
        .select({
          id: activityLogs.id,
          entityType: activityLogs.entityType,
          entityId: activityLogs.entityId,
          action: activityLogs.action,
          description: activityLogs.description,
          createdAt: activityLogs.createdAt,
          performedBy: UsersTable.name,
          capitalCallAmount: capitalCalls.amount,
          distributionAmount: distributions.amount,
          fundReportFundId: fundReports.fundId, // add joinable fundId from fundReports
        })
        .from(activityLogs)
        .innerJoin(UsersTable, eq(activityLogs.performedBy, UsersTable.id))
        .leftJoin(
          capitalCalls,
          and(
            eq(activityLogs.entityType, 'capital_call'),
            eq(activityLogs.entityId, capitalCalls.id),
          ),
        )
        .leftJoin(
          distributions,
          and(
            eq(activityLogs.entityType, 'distribution'),
            eq(activityLogs.entityId, distributions.id),
          ),
        )
        .leftJoin(
          fundReports,
          and(
            eq(activityLogs.entityType, 'fund_report'),
            eq(activityLogs.entityId, fundReports.id),
          ),
        )
        .where(
          or(eq(capitalCalls.fundId, id), eq(distributions.fundId, id), eq(fundReports.fundId, id)),
        )
        .orderBy(desc(activityLogs.createdAt));

      // Format history
      const history = logs.map((log) => {
        let description = log.description || '';
        const amount = log.capitalCallAmount || log.distributionAmount;

        const isCapitalCall = log.entityType === 'capital_call';
        const isDistribution = log.entityType === 'distribution';
        const isFundReport = log.entityType === 'fund_report';

        if (isCapitalCall) {
          if (log.action === 'created') {
            description = 'Capital call has been initiated';
          } else if (log.action === 'approved' && amount) {
            description = `${log.performedBy} invested $${amount.toLocaleString()}`;
          } else if (log.action === 'rejected') {
            description = 'Capital call has been rejected';
          }
        } else if (isDistribution) {
          if (log.action === 'created') {
            description = 'Profit Distribution has been initiated';
          } else if (log.action === 'approved' && amount) {
            description = `${log.performedBy} received distribution of $${amount.toLocaleString()}`;
          } else if (log.action === 'rejected') {
            description = 'Profit Distribution has been rejected';
          }
        } else if (isFundReport) {
          if (log.action === 'created') {
            description = `${log.performedBy} uploaded a Fund Report`;
          }
        } else if (log.action === 'created') {
          description = `${log.entityType.replace('_', ' ')} has been initiated`;
        }

        return {
          id: log.id,
          description,
          timeAgo: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
          timestamp: log.createdAt.toISOString(),
          entityType: log.entityType,
          action: log.action,
        };
      });

      return {
        ...rawFund,
        history,
      };
    });
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

    // Extract URLs correctly
    const documentUrls = documents.map((doc) => doc.fileUrl);
    const investorDocUrls = investors.flatMap((inv) => inv.documentUrl);

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

    // Only include funds where this investor exists
    const matchingFunds = result.filter((fund) =>
      (Array.isArray(fund.investors) ? fund.investors : []).some(
        (inv: any) => inv.investorId === investorId,
      ),
    );

    // Return only that investor’s data within each matched fund
    return matchingFunds.map((fund) => {
      const matchedInvestor = (fund.investors || []).filter(
        (inv: any) => inv.investorId === investorId,
      );

      return {
        id: fund.id,
        name: fund.name,
        fundSize: fund.fundSize,
        fundType: fund.fundType,
        fundDescription: fund.fundDescription,
        investors: matchedInvestor,
        createdAt: fund.createdAt,
      };
    });
  }

  static async updateInvestor(fundId: string, investors: Investor[]): Promise<void> {
    await db.update(funds).set({ investors }).where(eq(funds.id, fundId));
  }
}
