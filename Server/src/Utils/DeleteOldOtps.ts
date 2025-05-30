import { eq, or } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { OtpTable } from '../db/schema';

export const deleteOldOtps = async (email: string) => {
  await db.delete(OtpTable).where(or(eq(OtpTable.email, email)));
};
