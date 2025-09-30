import { db } from '../db/DbConnection';
import {
  taxReports,
  taxReportInvestors,
  activityLogs,
  UsersTable,
  userNotifications,
} from '../db/schema';
import { CreateTaxReportSchema, UpdateTaxReportSchema } from '../validators/taxReport.schema';
import { and, eq, sql } from 'drizzle-orm';
import { triggerEmailNotifications } from './emailNotification.service';
import { getDownloadUrl } from '../Utils/s3UploadDuplicate';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const create = async (data: {
  projectName: string;
  reportURL: string;
  year: string;
  quarter: string;
  createdBy: string;
  investorIds?: string[] | 'all';
}) => {
  return db.transaction(async (tx) => {
    const parsed = CreateTaxReportSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const [taxReport] = await tx
      .insert(taxReports)
      .values({
        projectName: data.projectName,
        reportURL: data.reportURL,
        createdBy: data.createdBy,
        year: data.year,
        quarter: data.quarter as 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4',
      })
      .returning();

    let investors: { id: string }[] = [];
    if (data.investorIds === 'all') {
      investors = await tx
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.referral, data.createdBy));
    } else if (Array.isArray(data.investorIds) && data.investorIds.length > 0) {
      investors = await tx
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(
          and(
            eq(UsersTable.referral, data.createdBy),
            sql`${UsersTable.id} IN (${data.investorIds.join(',')})`,
          ),
        );
    }

    if (investors.length > 0) {
      await tx.insert(taxReportInvestors).values(
        investors.map((investor) => ({
          taxReportId: taxReport.id,
          investorId: investor.id,
        })),
      );
    }

    // const [activityLog] = await tx
    //   .insert(activityLogs)
    //   .values({
    //     entityType: 'tax_report',
    //     entityId: taxReport.id,
    //     action: 'created',
    //     performedBy: data.createdBy,
    //     description: `Created tax report for project ${data.projectName}`,
    //     createdAt: new Date(),
    //   })
    //   .returning();

    const [creator] = await tx
      .select({ name: UsersTable.name })
      .from(UsersTable)
      .where(eq(UsersTable.id, data.createdBy));

    // if (investors.length > 0) {
    //   await tx.insert(userNotifications).values(
    //     investors.map((investor) => ({
    //       userId: investor.id,
    //       activityLogId: activityLog.id,
    //       isRead: false,
    //       isDeleted: false,
    //       createdAt: new Date(),
    //       updatedAt: new Date(),
    //     })),
    //   );

    //   triggerEmailNotifications({
    //     userIds: investors.map((i) => i.id),
    //     notificationData: {
    //       entityType: 'tax_report',
    //       action: 'created',
    //       projectName: data.projectName,
    //       performedByName: creator.name,
    //     },
    //     createdBy: data.createdBy,
    //   });
    // }

    return taxReport;
  });
};

type Quarter = 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4';

export const getTaxReports = async ({
  creatorId,
  userId,
  role,
  page,
  limit,
  year,
  quarter,
}: {
  creatorId: string;
  userId: string;
  role: string;
  page: number;
  limit: number;
  year?: string;
  quarter?: Quarter;
}): Promise<PaginatedResponse<any>> => {
  const offset = (page - 1) * limit;
  const conditions = [eq(taxReports.createdBy, creatorId)];

  if (year) conditions.push(eq(taxReports.year, year));
  if (quarter) conditions.push(eq(taxReports.quarter, quarter));

  if (role === 'investor') {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${taxReportInvestors}
        WHERE ${taxReportInvestors.taxReportId} = ${taxReports.id}
        AND ${taxReportInvestors.investorId} = ${userId}
      )`,
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [reports, totalCount] = await Promise.all([
    db
      .select({
        ...taxReports,
        investors: sql`
          COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', ${UsersTable.id},
                  'name', ${UsersTable.name}
                )
              )
              FROM ${taxReportInvestors}
              JOIN ${UsersTable} ON ${taxReportInvestors.investorId} = ${UsersTable.id}
              WHERE ${taxReportInvestors.taxReportId} = ${taxReports.id}
            ),
            '[]'::json
          )
        `.as('investors'),
      })
      .from(taxReports)
      .where(whereClause)
      .orderBy(sql`${taxReports.createdAt} DESC`)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(taxReports)
      .where(whereClause),
  ]);

  const total = Number(totalCount[0].count);
  const totalPages = Math.ceil(total / limit);

  return {
    data: reports, // investors already comes as a JSON array
    total,
    page,
    limit,
    totalPages,
  };
};

export const update = async (data: {
  id: string;
  projectName?: string;
  reportURL?: string;
  year?: string;
  quarter?: string;
  createdBy: string;
  investorIds?: string[] | 'all';
}) => {
  return db.transaction(async (tx) => {
    const parsed = UpdateTaxReportSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const [taxReport] = await tx
      .update(taxReports)
      .set({
        projectName: data.projectName,
        reportURL: data.reportURL,
        year: data.year,
        quarter: data.quarter as 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4',
        createdBy: data.createdBy,
        updatedAt: new Date(),
      })
      .where(and(eq(taxReports.id, data.id), eq(taxReports.createdBy, data.createdBy)))
      .returning();

    if (!taxReport) {
      throw new Error('Tax report not found or unauthorized');
    }

    if (data.investorIds !== undefined) {
      // Delete existing assignments
      await tx.delete(taxReportInvestors).where(eq(taxReportInvestors.taxReportId, taxReport.id));

      let investors: { id: string }[] = [];
      if (data.investorIds === 'all') {
        investors = await tx
          .select({ id: UsersTable.id })
          .from(UsersTable)
          .where(eq(UsersTable.referral, data.createdBy));
      } else if (Array.isArray(data.investorIds) && data.investorIds.length > 0) {
        investors = await tx
          .select({ id: UsersTable.id })
          .from(UsersTable)
          .where(
            and(
              eq(UsersTable.referral, data.createdBy),
              sql`${UsersTable.id} IN (${data.investorIds.join(',')})`,
            ),
          );
      }

      if (investors.length > 0) {
        await tx.insert(taxReportInvestors).values(
          investors.map((investor) => ({
            taxReportId: taxReport.id,
            investorId: investor.id,
          })),
        );
      }
    }

    // await tx.insert(activityLogs).values({
    //   entityType: 'tax_report',
    //   entityId: taxReport.id,
    //   action: 'updated',
    //   performedBy: data.createdBy,
    //   description: `Updated tax report for project ${taxReport.projectName}`,
    //   createdAt: new Date(),
    // });

    return taxReport;
  });
};

export const remove = async (id: string, createdBy: string) => {
  return db.transaction(async (tx) => {
    const [taxReport] = await tx
      .delete(taxReports)
      .where(and(eq(taxReports.id, id), eq(taxReports.createdBy, createdBy)))
      .returning();

    if (!taxReport) {
      throw new Error('Tax report not found or unauthorized');
    }

    // await tx.insert(activityLogs).values({
    //   entityType: 'tax_report',
    //   action: 'deleted',
    //   performedBy: createdBy,
    //   description: `Deleted tax report for project ${taxReport.projectName}`,
    //   createdAt: new Date(),
    // });
  });
};

export const getReportDownloadUrl = async (id: string) => {
  const [report] = await db.select().from(taxReports).where(eq(taxReports.id, id));

  if (!report) {
    throw new Error('Tax report not found');
  }

  const key = new URL(report.reportURL).pathname.substring(1); // remove leading "/"
  const filename = `${report.projectName}-report.pdf`;

  return await getDownloadUrl(key, filename);
};
