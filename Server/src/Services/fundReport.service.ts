import { db } from '../db/DbConnection';
import { fundReports, activityLogs } from '../db/schema';
import { CreateFundReportSchema } from '../validators/fundReport.schema';
import { eq, sql } from 'drizzle-orm';

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

export const getByFund = async (fundId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;

  const [data, [{ count }]] = await Promise.all([
    db.select().from(fundReports).where(eq(fundReports.fundId, fundId)).limit(limit).offset(offset),
    db
      .select({ count: sql`count(*)::integer` })
      .from(fundReports)
      .where(eq(fundReports.fundId, fundId)),
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
