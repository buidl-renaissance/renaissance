import { getBookmarkedEvents, LocalEventType, mapSourceToEventType } from "./bookmarks";
import { getAllGoingEvents } from "./rsvp";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";
import { getBookmarksFromBackend, Bookmark, BookmarkSource } from "../api/bookmarks";
import * as SecureStore from "expo-secure-store";

const AUTH_STORAGE_KEY = "AUTH_USER";

export type SharedEvent = {
  event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent;
  eventType: LocalEventType;
  sharedBy: "both" | "me" | "them";
};

/**
 * Get the backend user ID from stored auth state
 */
async function getStoredBackendUserId(): Promise<number | undefined> {
  try {
    const savedAuth = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      return user?.local?.backendUserId;
    }
  } catch (error) {
    console.error("[SharedEvents] Error reading auth state:", error);
  }
  return undefined;
}

/**
 * Fetch bookmarks for a user from the backend
 * @param userId The user ID to fetch bookmarks for
 * @param requesterId The requester's user ID (must have verified connection)
 * @returns Array of bookmarks
 */
async function fetchUserBookmarksFromBackend(
  userId: number,
  requesterId: number
): Promise<Bookmark[]> {
  try {
    console.log(`[SharedEvents] Fetching bookmarks for user ${userId} (requester: ${requesterId})`);
    const bookmarks = await getBookmarksFromBackend(userId, requesterId);
    console.log(`[SharedEvents] Fetched ${bookmarks.length} bookmarks for user ${userId}`);
    return bookmarks;
  } catch (error) {
    console.error(`[SharedEvents] Error fetching bookmarks for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get events that are shared between the current user and a connection
 * Fetches the other user's bookmarks from the backend and compares with local bookmarks
 * @param otherUserId The backend user ID of the connected user
 */
export async function getSharedEvents(otherUserId?: number): Promise<SharedEvent[]> {
  console.log(`[SharedEvents] getSharedEvents called with otherUserId=${otherUserId}`);
  
  // Get current user's events (bookmarked + going)
  const myBookmarkedEvents = await getBookmarkedEvents();
  const myGoingEvents = await getAllGoingEvents();
  
  // Create a map of current user's events
  const myEventsMap = new Map<string, SharedEvent>();
  
  myBookmarkedEvents.forEach(({ event, eventType }) => {
    const eventId = getEventId(event, eventType);
    myEventsMap.set(eventId, {
      event,
      eventType,
      sharedBy: "me",
    });
  });
  
  myGoingEvents.forEach(({ event, eventType }) => {
    const eventId = getEventId(event, eventType);
    if (!myEventsMap.has(eventId)) {
      myEventsMap.set(eventId, {
        event,
        eventType,
        sharedBy: "me",
      });
    }
  });

  // If no other user specified, just return current user's events
  if (!otherUserId) {
    console.log(`[SharedEvents] No otherUserId provided, returning ${myEventsMap.size} of my events`);
    return Array.from(myEventsMap.values());
  }

  // Get current user's backend ID
  const myBackendUserId = await getStoredBackendUserId();
  if (!myBackendUserId) {
    console.log("[SharedEvents] No backend user ID found, returning my events only");
    return Array.from(myEventsMap.values());
  }

  // Fetch other user's bookmarks from backend
  const otherUserBookmarks = await fetchUserBookmarksFromBackend(otherUserId, myBackendUserId);
  
  // Create a set of other user's bookmark IDs for quick lookup
  const otherUserBookmarkIds = new Set<string>();
  otherUserBookmarks.forEach((bookmark) => {
    const eventType = mapSourceToEventType(bookmark.source);
    const eventId = `${eventType}-${bookmark.eventId}`;
    otherUserBookmarkIds.add(eventId);
  });
  
  console.log(`[SharedEvents] Other user has ${otherUserBookmarkIds.size} bookmark IDs`);
  
  // Find shared events (events that both users have bookmarked)
  const sharedEvents: SharedEvent[] = [];
  
  myEventsMap.forEach((myEvent, eventId) => {
    if (otherUserBookmarkIds.has(eventId)) {
      // Both users have this event
      sharedEvents.push({
        ...myEvent,
        sharedBy: "both",
      });
    }
  });
  
  console.log(`[SharedEvents] Found ${sharedEvents.length} shared events`);
  
  return sharedEvents;
}

/**
 * Get all of a user's bookmarks from the backend
 * Useful for displaying what events a connection has bookmarked
 * @param userId The user ID to fetch bookmarks for
 * @returns Array of Bookmark objects
 */
export async function getConnectionBookmarks(userId: number): Promise<Bookmark[]> {
  const myBackendUserId = await getStoredBackendUserId();
  if (!myBackendUserId) {
    console.log("[SharedEvents] No backend user ID found, cannot fetch connection bookmarks");
    return [];
  }
  
  return fetchUserBookmarksFromBackend(userId, myBackendUserId);
}

/**
 * Get a unique ID for an event based on its type
 */
function getEventId(
  event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: LocalEventType
): string {
  switch (eventType) {
    case "da":
      return `da-${(event as DAEvent).id}`;
    case "luma":
      return `luma-${(event as LumaEvent).apiId}`;
    case "ra":
      return `ra-${(event as RAEvent).id}`;
    case "meetup":
      return `meetup-${(event as MeetupEvent).eventId}`;
    case "sports":
      return `sports-${(event as SportsGame).id}`;
    case "instagram":
      return `instagram-${(event as InstagramEvent).id}`;
    default:
      return `unknown-${JSON.stringify(event)}`;
  }
}
