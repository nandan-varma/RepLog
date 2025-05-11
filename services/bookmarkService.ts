import { db, bookmarks } from '@/db';
import { eq, and } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

export type Bookmark = InferSelectModel<typeof bookmarks>;

export const bookmarkService = {
  /**
   * Get all bookmarks
   */
  getAll: async (): Promise<Bookmark[]> => {
    try {
      return await db.select().from(bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      return [];
    }
  },

  /**
   * Check if an exercise is bookmarked
   */
  isBookmarked: async (exerciseId: string): Promise<boolean> => {
    try {
      const result = await db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.exerciseId, exerciseId));
      return result.length > 0;
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
      return false;
    }
  },

  /**
   * Toggle bookmark status for an exercise
   */
  toggleBookmark: async (exerciseId: string): Promise<boolean> => {
    try {
      const isAlreadyBookmarked = await bookmarkService.isBookmarked(exerciseId);
      
      if (isAlreadyBookmarked) {
        await db
          .delete(bookmarks)
          .where(eq(bookmarks.exerciseId, exerciseId));
        return false;
      } else {
        await db
          .insert(bookmarks)
          .values({ 
            exerciseId,
            createdAt: new Date().toISOString()
          });
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  }
};
