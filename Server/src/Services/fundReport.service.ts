import { db } from '../db/DbConnection';
import { fundReports, activityLogs, UsersTable, funds, userNotifications } from '../db/schema';
import { CreateFundReportSchema } from '../validators/fundReport.schema';
import { and, eq, or, sql } from 'drizzle-orm';
import { triggerEmailNotifications } from './emailNotification.service';

export const create = async (data: {
  fundId: string;
  projectName: string;
  description: string;
  documentUrl: string;
  year: string;
  quarter: string;
  createdBy: string;
  investorIds?: string[];
}) => {
  return db.transaction(async (tx) => {
    // Validate input data
    const parsed = CreateFundReportSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    // Fetch fund to validate investorIds
    const [fund] = await tx
      .select({
        name: funds.name,
        fundManagerId: funds.fundManagerId,
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, data.fundId));

    if (!fund) {
      throw new Error('Fund not found');
    }

    // Validate investorIds if provided
    if (data.investorIds && data.investorIds.length > 0) {
      const invalidIds = data.investorIds.filter((id) => !fund.investorIds.includes(id));
      if (invalidIds.length > 0) {
        throw new Error('Invalid investor IDs provided');
      }
    }

    // Insert the fund report
    const [fundReport] = await tx
      .insert(fundReports)
      .values({
        fundId: data.fundId,
        createdBy: data.createdBy,
        projectName: data.projectName,
        description: data.description,
        documentUrl: data.documentUrl,
        year: data.year,
        quarter: data.quarter,
        investorIds: data.investorIds || null, // Store null for all investors
      })
      .returning();

    // Insert the activity log
    const description = data.investorIds?.length
      ? `Created fund report for fund ID ${data.fundId} shared with ${data.investorIds.length} investors`
      : `Created fund report for fund ID ${data.fundId} shared with all investors`;
    const [activityLog] = await tx
      .insert(activityLogs)
      .values({
        entityType: 'fund_report',
        entityId: fundReport.id,
        action: 'created',
        performedBy: data.createdBy,
        fundId: data.fundId,
        description,
        createdAt: new Date(),
      })
      .returning();

    // Fetch creator's name for email notifications
    const [creator] = await tx
      .select({
        name: UsersTable.name,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, data.createdBy));

    // Prepare user IDs to notify
    const usersToNotify = data.investorIds?.length ? data.investorIds : fund.investorIds;

    // Insert user_notifications
    if (usersToNotify.length > 0) {
      await tx.insert(userNotifications).values(
        usersToNotify.map((userId) => ({
          userId,
          activityLogId: activityLog.id,
          isRead: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      );

      // Trigger email notifications
      triggerEmailNotifications({
        userIds: usersToNotify,
        notificationData: {
          entityType: 'fund_report',
          action: 'created',
          fundName: fund.name,
          performedByName: creator.name,
        },
        createdBy: data.createdBy,
      });
    }

    return fundReport;
  });
};
export const getByFund = async (
  fundId: string,
  page: number = 1,
  limit: number = 10,
  year?: string,
  quarter?: string,
  userId?: string,
  role?: string,
) => {
  const offset = (page - 1) * limit;

  // Build conditions array
  const conditions = [eq(fundReports.fundId, fundId)];
  if (year) conditions.push(eq(fundReports.year, year));
  if (quarter) conditions.push(eq(fundReports.quarter, quarter));

  // For investors, filter by investorIds
  if (role === 'investor' && userId) {
    // Verify user is an investor in the fund
    const [fund] = await db
      .select({
        investorIds: sql<string[]>`jsonb_path_query_array(${funds.investors}, '$.investorId')`,
      })
      .from(funds)
      .where(eq(funds.id, fundId));
    if (!fund || !fund.investorIds.includes(userId)) {
      throw new Error('User is not an investor in this fund');
    }

    conditions.push(
      or(
        eq(fundReports.investorIds, null), // Shared with all
        sql`${userId} = ANY(${fundReports.investorIds})`, // User is in investorIds
      ),
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [data, [{ count }]] = await Promise.all([
    db
      .select({
        id: fundReports.id,
        fundId: fundReports.fundId,
        createdBy: fundReports.createdBy,
        projectName: fundReports.projectName,
        description: fundReports.description,
        documentUrl: fundReports.documentUrl,
        year: fundReports.year,
        quarter: fundReports.quarter,
        investorIds: fundReports.investorIds, // Include for UI display
        createdAt: fundReports.createdAt,
        createdByName: UsersTable.name,
      })
      .from(fundReports)
      .leftJoin(UsersTable, eq(fundReports.createdBy, UsersTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql`count(*)::integer` })
      .from(fundReports)
      .where(whereClause),
  ]);

  const totalItems = Number(count || 0);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    totalItems,
    totalPages,
    currentPage: page,
  };
};
