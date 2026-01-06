import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/Auth";
import {
  getConnectionBookmarks,
  ConnectionBookmarksResponse,
  Bookmark,
  ConnectionBookmarkUser,
  BookmarkSource,
} from "../api/bookmarks";

/**
 * Connection bookmark with user info attached
 */
export interface ConnectionBookmarkWithUser extends Bookmark {
  user: ConnectionBookmarkUser;
}

/**
 * Hook to fetch bookmarks from verified connections
 * Returns bookmarks with their associated user information
 */
export function useConnectionBookmarks() {
  const { state: authState } = useAuth();
  const [bookmarks, setBookmarks] = useState<ConnectionBookmarkWithUser[]>([]);
  const [users, setUsers] = useState<ConnectionBookmarkUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionBookmarks = useCallback(async () => {
    // Only fetch if authenticated and has a username
    const username = authState.user?.username;
    if (!authState.isAuthenticated || !username) {
      console.log("[useConnectionBookmarks] Not authenticated or no username, skipping fetch");
      setBookmarks([]);
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[useConnectionBookmarks] Fetching connection bookmarks for:", username);
      const response: ConnectionBookmarksResponse = await getConnectionBookmarks(username);

      // Create a map of userId to user for quick lookup
      const userMap = new Map<number, ConnectionBookmarkUser>();
      response.users.forEach((user) => {
        userMap.set(user.id, user);
      });

      // Attach user info to each bookmark
      const bookmarksWithUsers: ConnectionBookmarkWithUser[] = response.bookmarks
        .map((bookmark) => {
          const user = userMap.get(bookmark.userId);
          if (!user) {
            console.warn("[useConnectionBookmarks] User not found for bookmark:", bookmark.id);
            return null;
          }
          return {
            ...bookmark,
            user,
          };
        })
        .filter((b): b is ConnectionBookmarkWithUser => b !== null);

      console.log("[useConnectionBookmarks] Processed bookmarks:", bookmarksWithUsers.length);
      setBookmarks(bookmarksWithUsers);
      setUsers(response.users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch connection bookmarks";
      console.error("[useConnectionBookmarks] Error:", errorMessage);
      setError(errorMessage);
      setBookmarks([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.user?.username]);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    fetchConnectionBookmarks();
  }, [fetchConnectionBookmarks]);

  /**
   * Get bookmarks grouped by date key (YYYY-MM-DD format)
   * Useful for integrating with the EventForecast component
   */
  const getBookmarksByDate = useCallback((): Map<string, ConnectionBookmarkWithUser[]> => {
    const byDate = new Map<string, ConnectionBookmarkWithUser[]>();
    // Note: The API returns bookmarks without date info, so we can't group by date directly
    // This would need to be enriched with event data to be useful
    return byDate;
  }, [bookmarks]);

  /**
   * Get bookmarks by source type
   */
  const getBookmarksBySource = useCallback((source: BookmarkSource): ConnectionBookmarkWithUser[] => {
    return bookmarks.filter((b) => b.source === source);
  }, [bookmarks]);

  /**
   * Get bookmarks by user ID
   */
  const getBookmarksByUser = useCallback((userId: number): ConnectionBookmarkWithUser[] => {
    return bookmarks.filter((b) => b.userId === userId);
  }, [bookmarks]);

  /**
   * Check if a specific event is bookmarked by any connection
   */
  const isBookmarkedByConnection = useCallback(
    (eventId: string, source: BookmarkSource): ConnectionBookmarkWithUser | undefined => {
      return bookmarks.find((b) => b.eventId === eventId && b.source === source);
    },
    [bookmarks]
  );

  /**
   * Get all connections who bookmarked a specific event
   */
  const getConnectionsForEvent = useCallback(
    (eventId: string, source: BookmarkSource): ConnectionBookmarkUser[] => {
      return bookmarks
        .filter((b) => b.eventId === eventId && b.source === source)
        .map((b) => b.user);
    },
    [bookmarks]
  );

  /**
   * Get bookmark count per event (for showing popularity among connections)
   */
  const getBookmarkCountForEvent = useCallback(
    (eventId: string, source: BookmarkSource): number => {
      return bookmarks.filter((b) => b.eventId === eventId && b.source === source).length;
    },
    [bookmarks]
  );

  return {
    bookmarks,
    users,
    loading,
    error,
    refresh: fetchConnectionBookmarks,
    getBookmarksBySource,
    getBookmarksByUser,
    isBookmarkedByConnection,
    getConnectionsForEvent,
    getBookmarkCountForEvent,
  };
}

export default useConnectionBookmarks;
