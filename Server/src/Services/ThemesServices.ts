import { db } from '../db/DbConnection';
import { themes, UsersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
export interface ThemeUpdateRequest {
  userId: string;
  themeId: string;
}
export interface Theme {
  id?: string;
  userId?: string;
  name?: string;
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
  createdAt?: string;
  selectedTheme?: string | null;
}
export interface ThemeResponse {
  success: boolean;
  message?: string;
  selectedTheme?: Theme;
  error?: string;
}
export class ThemeService {
  async create(data: any, userId: string) {
    const [createdTheme] = await db
      .insert(themes)
      .values({ ...data, userId })
      .returning();

    return createdTheme;
  }

  async update(id: string, data: any, userId: string) {
    return await db.update(themes).set(data).where(eq(themes.id, id)).returning();
  }

  async delete(id: string, userId: string) {
    return await db.delete(themes).where(eq(themes.id, id));
  }

  async getById(id: string, userId: string) {
    return await db.select().from(themes).where(eq(themes.id, id));
  }

  async list(userId: string) {
    return await db.select().from(themes).where(eq(themes.userId, userId));
  }
  async updateSelectedTheme(request: ThemeUpdateRequest): Promise<ThemeResponse> {
    try {
      const { userId, themeId } = request;

      // Validate input
      if (!userId || !themeId) {
        return {
          success: false,
          error: 'User ID and Theme ID are required',
        };
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.id, userId))
        .limit(1);

      if (!existingUser.length) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Update user's selected theme
      const updatedUser = await db
        .update(UsersTable)
        .set({
          selectedTheme: themeId,
          updatedAt: new Date(),
        })
        .where(eq(UsersTable.id, userId))
        .returning({
          id: UsersTable.id,
          selectedTheme: UsersTable.selectedTheme,
        });

      if (!updatedUser.length) {
        return {
          success: false,
          error: 'Failed to update theme selection',
        };
      }
      await db
        .update(UsersTable)
        .set({
          selectedTheme: themeId,
          updatedAt: new Date(),
        })
        .where(eq(UsersTable.referral, userId));
      // Fetch the full theme object using the selectedTheme id
      let theme: Theme | undefined = undefined;
      if (updatedUser[0].selectedTheme) {
        const themeResult = await db
          .select()
          .from(themes)
          .where(eq(themes.id, updatedUser[0].selectedTheme))
          .limit(1);
        if (themeResult.length) {
          theme = {
            ...themeResult[0],
            createdAt: themeResult[0].createdAt
              ? themeResult[0].createdAt.toISOString()
              : undefined,
          };
        }
      }
      return {
        success: true,
        message: 'Theme updated successfully',
        selectedTheme: theme,
      };
    } catch (error) {
      console.error('ThemeService - updateSelectedTheme error:', error);
      return {
        success: false,
        error: 'Internal server error while updating theme',
      };
    }
  }

  /**
   * Get user's selected theme ID
   */
  async getSelectedTheme(themeId: string): Promise<ThemeResponse> {
    try {
      if (!themeId) {
        return {
          success: false,
          error: 'User ID is required',
        };
      }

      const selectedTheme = await db.select().from(themes).where(eq(themes.id, themeId));
      if (!selectedTheme.length) {
        return {
          success: false,
          error: 'Selected theme not found',
        };
      }
      // Convert createdAt to string if present, otherwise undefined
      const theme: Theme = {
        ...selectedTheme[0],
        createdAt: selectedTheme[0].createdAt
          ? selectedTheme[0].createdAt.toISOString()
          : undefined,
      };
      return {
        success: true,
        selectedTheme: theme,
        message: 'Selected theme fetched successfully',
      };
    } catch (error) {
      console.error('ThemeService - getSelectedTheme error:', error);
      return {
        success: false,
        error: 'Internal server error while fetching theme',
      };
    }
  }

  /**
   * Remove user's selected theme (set to null)
   */
  async clearSelectedTheme(userId: string): Promise<ThemeResponse> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required',
        };
      }

      const updatedUser = await db
        .update(UsersTable)
        .set({
          selectedTheme: null,
          updatedAt: new Date(),
        })
        .where(eq(UsersTable.id, userId))
        .returning({ id: UsersTable.id });

      if (!updatedUser.length) {
        return {
          success: false,
          error: 'User not found or theme not cleared',
        };
      }

      return {
        success: true,
        message: 'Theme selection cleared successfully',
      };
    } catch (error) {
      console.error('ThemeService - clearSelectedTheme error:', error);
      return {
        success: false,
        error: 'Internal server error while clearing theme',
      };
    }
  }
}
