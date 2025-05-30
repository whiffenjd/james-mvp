import { db } from '../db/DbConnection';
import { UserTokens } from '../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Deletes all tokens of a specific type for a given user.
 *
 * @param userId - The ID of the user.
 * @param email - The email of the user.
 * @param type - The type of token to delete (e.g., "reset_password", "auth").
 */
export const deleteUserTokenByType = async (userId: string, email: string, type: string) => {
  await db
    .delete(UserTokens)
    .where(
      and(eq(UserTokens.userId, userId), eq(UserTokens.email, email), eq(UserTokens.type, type)),
    );
};
