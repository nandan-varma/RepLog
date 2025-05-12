/**
 * A simple event bus for bookmark status changes
 */

type BookmarkEventListener = (exerciseId: string, isBookmarked: boolean) => void;

class BookmarkEventBus {
  private listeners: BookmarkEventListener[] = [];

  /**
   * Subscribe to bookmark events
   */
  subscribe(listener: BookmarkEventListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit a bookmark change event to all listeners
   */
  emit(exerciseId: string, isBookmarked: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(exerciseId, isBookmarked);
      } catch (error) {
        console.error('Error in bookmark event listener:', error);
      }
    });
  }
}

// Export a singleton instance
export const bookmarkEvents = new BookmarkEventBus();
