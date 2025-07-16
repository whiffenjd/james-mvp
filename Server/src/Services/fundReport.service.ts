import { db } from '../db/DbConnection';
import { fundReports, activityLogs, UsersTable } from '../db/schema';
import { CreateFundReportSchema } from '../validators/fundReport.schema';
import { and, eq, sql } from 'drizzle-orm';

export const create = async (data: {
  fundId: string;
  projectName: string;
  description: string;
  documentUrl: string;
  year: string;
  quarter: string;
  createdBy: string;
}) => {
  return db.transaction(async (tx) => {
    const parsed = CreateFundReportSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

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
      })
      .returning();

    await tx.insert(activityLogs).values({
      entityType: 'fund_report',
      entityId: fundReport.id,
      action: 'created',
      performedBy: data.createdBy,
      description: `Created fund report for fund ID ${data.fundId}`,
      createdAt: new Date(),
    });

    return fundReport;
  });
};

export const getByFund = async (
  fundId: string,
  page: number = 1,
  limit: number = 10,
  year?: string,
  quarter?: string,
) => {
  const offset = (page - 1) * limit;

  // Build conditions array
  const conditions = [eq(fundReports.fundId, fundId)];
  if (year) conditions.push(eq(fundReports.year, year));
  if (quarter) conditions.push(eq(fundReports.quarter, quarter));

  // Reduce conditions into a single and clause if there are multiple
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
