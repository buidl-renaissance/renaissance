import { getWallet } from "../utils/wallet";

const API_BASE_URL = "https://people.builddetroit.xyz/api";

/**
 * Valid bookmark sources that the backend accepts
 */
export type BookmarkSource = 'instagram' | 'meetup' | 'eventbrite' | 'luma' | 'custom' | 'sports' | 'ra' | 'renaissance';

/**
 * Bookmark response type from the backend
 */
export interface Bookmark {
  id: number;
  userId: number;
  eventId: string;
  source: BookmarkSource;
  createdAt: string;
}

/**
 * Construct the message that needs to be signed for viewing bookmarks
 * Message format: "View bookmarks: requester {requesterId} viewing user {userId}"
 */
export function constructViewBookmarksMessage(
  requesterId: number,
  userId: number
): string {
  return `View bookmarks: requester ${requesterId} viewing user ${userId}`;
}

/**
 * Construct the message that needs to be signed for adding a bookmark
 * Message format: "Add bookmark for user {userId}: {source}/{eventId}"
 */
export function constructAddBookmarkMessage(
  userId: number,
  source: BookmarkSource,
  eventId: string
): string {
  return `Add bookmark for user ${userId}: ${source}/${eventId}`;
}

/**
 * Construct the message that needs to be signed for removing a bookmark
 * Message format: "Remove bookmark for user {userId}: {source}/{eventId}"
 */
export function constructRemoveBookmarkMessage(
  userId: number,
  source: BookmarkSource,
  eventId: string
): string {
  return `Remove bookmark for user ${userId}: ${source}/${eventId}`;
}

/**
 * Sign a message with the wallet
 */
export async function signBookmarkMessage(message: string): Promise<string> {
  const wallet = await getWallet();
  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Get all bookmarks for a user from the backend
 * @param userId User ID whose bookmarks to retrieve
 * @param requesterId User ID of the requester (must be same user or have verified connection)
 * @param source Optional filter by event source
 * @returns Promise<Bookmark[]>
 */
export async function getBookmarksFromBackend(
  userId: number,
  requesterId: number,
  source?: BookmarkSource
): Promise<Bookmark[]> {
  try {
    const message = constructViewBookmarksMessage(requesterId, userId);
    const signature = await signBookmarkMessage(message);

    const params = new URLSearchParams();
    params.append("userId", userId.toString());
    params.append("requesterId", requesterId.toString());
    params.append("signature", signature);
    if (source) {
      params.append("source", source);
    }

    const url = `${API_BASE_URL}/bookmarks?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch bookmarks";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching bookmarks from backend:", error);
    throw error;
  }
}

/**
 * Create a new bookmark on the backend
 * @param userId User ID
 * @param eventId Event identifier string
 * @param source Event source
 * @returns Promise<Bookmark>
 */
export async function createBookmarkOnBackend(
  userId: number,
  eventId: string,
  source: BookmarkSource
): Promise<Bookmark> {
  try {
    const message = constructAddBookmarkMessage(userId, source, eventId);
    console.log("[BookmarksAPI] Message to sign:", message);
    
    const signature = await signBookmarkMessage(message);
    console.log("[BookmarksAPI] Signature generated:", signature ? `${signature.substring(0, 20)}...` : "null");

    const requestBody = {
      userId,
      eventId,
      source,
      signature,
    };
    
    console.log("[BookmarksAPI] POST /bookmarks Request:", {
      url: `${API_BASE_URL}/bookmarks`,
      body: { ...requestBody, signature: `${signature.substring(0, 20)}...` },
    });

    const response = await fetch(`${API_BASE_URL}/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[BookmarksAPI] Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BookmarksAPI] Error response:", errorText);
      let errorMessage = "Failed to create bookmark";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[BookmarksAPI] Success response:", result);
    return result;
  } catch (error) {
    console.error("[BookmarksAPI] Error creating bookmark:", error);
    throw error;
  }
}

/**
 * Get a bookmark by its ID
 * @param id Bookmark ID
 * @returns Promise<Bookmark>
 */
export async function getBookmarkById(id: number): Promise<Bookmark> {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch bookmark";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching bookmark by ID:", error);
    throw error;
  }
}

/**
 * Delete a bookmark from the backend
 * @param id Bookmark ID
 * @param userId User ID (for signature message)
 * @param source Event source (for signature message)
 * @param eventId Event ID (for signature message)
 * @returns Promise<void>
 */
export async function deleteBookmarkFromBackend(
  id: number,
  userId: number,
  source: BookmarkSource,
  eventId: string
): Promise<void> {
  try {
    const message = constructRemoveBookmarkMessage(userId, source, eventId);
    const signature = await signBookmarkMessage(message);

    const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to delete bookmark";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error deleting bookmark from backend:", error);
    throw error;
  }
}

/**
 * Helper to find and delete a bookmark by userId, source, and eventId
 * First fetches bookmarks to find the matching one, then deletes it
 */
export async function deleteBookmarkByEvent(
  userId: number,
  source: BookmarkSource,
  eventId: string
): Promise<void> {
  try {
    // Get user's bookmarks filtered by source
    const bookmarks = await getBookmarksFromBackend(userId, userId, source);
    
    // Find the bookmark that matches the eventId
    const bookmark = bookmarks.find(b => b.eventId === eventId);
    
    if (!bookmark) {
      console.log("Bookmark not found on backend, may only exist locally");
      return;
    }
    
    // Delete the bookmark
    await deleteBookmarkFromBackend(bookmark.id, userId, source, eventId);
  } catch (error) {
    console.error("Error deleting bookmark by event:", error);
    throw error;
  }
}

/**
 * Connection bookmark user type from the backend
 */
export interface ConnectionBookmarkUser {
  id: number;
  publicAddress: string;
  username: string;
  name: string | null;
  profilePicture: string | null;
  farcasterId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response type for connection bookmarks endpoint
 */
export interface ConnectionBookmarksResponse {
  bookmarks: Bookmark[];
  users: ConnectionBookmarkUser[];
}

/**
 * Construct the message that needs to be signed for fetching connection bookmarks
 * Message format: "Fetch connection bookmarks for user: {username}"
 */
export function constructConnectionBookmarksMessage(username: string): string {
  return `Fetch connection bookmarks for user: ${username}`;
}

/**
 * Get all bookmarks from verified connections of a user
 * @param username Username of the requesting user
 * @returns Promise<ConnectionBookmarksResponse>
 */
export async function getConnectionBookmarks(
  username: string
): Promise<ConnectionBookmarksResponse> {
  try {
    const message = constructConnectionBookmarksMessage(username);
    const signature = await signBookmarkMessage(message);

    const params = new URLSearchParams();
    params.append("signature", signature);

    const url = `${API_BASE_URL}/bookmarks/connections/${encodeURIComponent(username)}?${params.toString()}`;

    console.log("[BookmarksAPI] GET /bookmarks/connections Request:", {
      url,
      username,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[BookmarksAPI] Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BookmarksAPI] Error response:", errorText);
      let errorMessage = "Failed to fetch connection bookmarks";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[BookmarksAPI] Connection bookmarks fetched:", {
      bookmarkCount: result.bookmarks?.length || 0,
      userCount: result.users?.length || 0,
    });
    return result;
  } catch (error) {
    console.error("[BookmarksAPI] Error fetching connection bookmarks:", error);
    throw error;
  }
}
