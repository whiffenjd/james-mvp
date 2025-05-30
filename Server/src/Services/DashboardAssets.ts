import { db } from '../db/DbConnection';
import { websiteAssets } from '../db/schema';
import { eq } from 'drizzle-orm';

export class WebsiteAssetService {
  async upsert(data: any, userId: string) {
    const existing = await db.select().from(websiteAssets).where(eq(websiteAssets.userId, userId));
    if (existing.length) {
      return await db
        .update(websiteAssets)
        .set(data)
        .where(eq(websiteAssets.userId, userId))
        .returning();
    } else {
      return await db
        .insert(websiteAssets)
        .values({ ...data, userId })
        .returning();
    }
  }

  async get(userId: string) {
    const result = await db
      .select()
      .from(websiteAssets)
      .where(eq(websiteAssets.userId, userId))
      .limit(1);

    return result[0] ?? null;
  }

  async delete(userId: string) {
    return await db.delete(websiteAssets).where(eq(websiteAssets.userId, userId));
  }
}
