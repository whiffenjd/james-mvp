import { db } from '../db/DbConnection';
import { taxReports, taxReportInvestors, UsersTable } from '../db/schema';
import { CreateTaxReportSchema, UpdateTaxReportSchema } from '../validators/taxReport.schema';
import { and, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { getDownloadUrl } from '../Utils/s3UploadDuplicate';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type Quarter = 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4';

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
    if (data.investorIds) {
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
            and(eq(UsersTable.referral, data.createdBy), inArray(UsersTable.id, data.investorIds)),
          );
      }
    }

    if (investors.length > 0) {
      await tx.insert(taxReportInvestors).values(
        investors.map((investor) => ({
          taxReportId: taxReport.id,
          investorId: investor.id,
        })),
      );
    }

    return {
      ...taxReport,
      investors: investors.map((investor) => ({ id: investor.id })),
    };
  });
};

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

  const reports = await db
    .select({
      ...getTableColumns(taxReports), // ✅ shorthand for all columns
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
            JOIN ${UsersTable} 
              ON ${taxReportInvestors.investorId} = ${UsersTable.id}
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
    .offset(offset);

  const [totalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(taxReports)
    .where(whereClause);

  const total = Number(totalCount.count);
  const totalPages = Math.ceil(total / limit);

  return {
    data: reports,
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
            and(eq(UsersTable.referral, data.createdBy), inArray(UsersTable.id, data.investorIds)),
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

      return {
        ...taxReport,
        investors: investors.map((investor) => ({ id: investor.id })),
      };
    }

    const assignedInvestors = await tx
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
      })
      .from(taxReportInvestors)
      .innerJoin(UsersTable, eq(taxReportInvestors.investorId, UsersTable.id))
      .where(eq(taxReportInvestors.taxReportId, taxReport.id));

    return {
      ...taxReport,
      investors: assignedInvestors,
    };
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
  });
};

export const getReportDownloadUrl = async (id: string) => {
  const [report] = await db.select().from(taxReports).where(eq(taxReports.id, id));

  if (!report) {
    throw new Error('Tax report not found');
  }

  const key = new URL(report.reportURL).pathname.substring(1);
  const filename = `${report.projectName}-report.pdf`;

  return await getDownloadUrl(key, filename);
};
