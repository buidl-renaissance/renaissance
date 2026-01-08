import { getBookmarkedEvents, LocalEventType, mapSourceToEventType } from "./bookmarks";
import { getAllGoingEvents } from "./rsvp";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame, getUpcomingSportsGames } from "../api/sports-games";
import { getBookmarksFromBackend, Bookmark, BookmarkSource } from "../api/bookmarks";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
 * Build a map of all available events from various sources
 * This includes events from local storage, APIs, and cached data
 */
async function buildAllEventsMap(): Promise<Map<string, { event: any; eventType: LocalEventType }>> {
  const allEventsMap = new Map<string, { event: any; eventType: LocalEventType }>();
  
  // Get DA events from API
  try {
    const eventsRes = await fetch("https://api.detroiter.network/api/events");
    const fetchedEvents = await eventsRes.json();
    const daEvents: DAEvent[] = fetchedEvents.data || [];
    daEvents.forEach((event) => {
      allEventsMap.set(`da-${event.id}`, { event, eventType: 'da' });
    });
    console.log(`[SharedEvents] Loaded ${daEvents.length} DA events`);
  } catch (error) {
    console.error("[SharedEvents] Error fetching DA events:", error);
  }
  
  // Get Luma events from local storage
  try {
    const lumaBookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    if (lumaBookmarksData) {
      const lumaEvents: LumaEvent[] = JSON.parse(lumaBookmarksData);
      lumaEvents.forEach((event) => {
        allEventsMap.set(`luma-${event.apiId}`, { event, eventType: 'luma' });
      });
      console.log(`[SharedEvents] Loaded ${lumaEvents.length} Luma events from storage`);
    }
  } catch (error) {
    console.error("[SharedEvents] Error loading Luma events:", error);
  }
  
  // Get RA events from local storage
  try {
    const raBookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    if (raBookmarksData) {
      const raEvents: RAEvent[] = JSON.parse(raBookmarksData);
      raEvents.forEach((event) => {
        allEventsMap.set(`ra-${event.id}`, { event, eventType: 'ra' });
      });
      console.log(`[SharedEvents] Loaded ${raEvents.length} RA events from storage`);
    }
  } catch (error) {
    console.error("[SharedEvents] Error loading RA events:", error);
  }
  
  // Get Meetup events from local storage
  try {
    const meetupBookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    if (meetupBookmarksData) {
      const meetupEvents: MeetupEvent[] = JSON.parse(meetupBookmarksData);
      meetupEvents.forEach((event) => {
        allEventsMap.set(`meetup-${event.eventId}`, { event, eventType: 'meetup' });
      });
      console.log(`[SharedEvents] Loaded ${meetupEvents.length} Meetup events from storage`);
    }
  } catch (error) {
    console.error("[SharedEvents] Error loading Meetup events:", error);
  }
  
  // Get Sports games from API (upcoming games)
  try {
    const sportsGames = await getUpcomingSportsGames();
    sportsGames.forEach((game) => {
      allEventsMap.set(`sports-${game.id}`, { event: game, eventType: 'sports' });
    });
    console.log(`[SharedEvents] Loaded ${sportsGames.length} Sports games from API`);
  } catch (error) {
    console.error("[SharedEvents] Error fetching Sports games:", error);
  }
  
  // Also load bookmarked sports games from storage (might include past games)
  try {
    const sportsBookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    if (sportsBookmarksData) {
      const sportsGames: SportsGame[] = JSON.parse(sportsBookmarksData);
      sportsGames.forEach((game) => {
        if (!allEventsMap.has(`sports-${game.id}`)) {
          allEventsMap.set(`sports-${game.id}`, { event: game, eventType: 'sports' });
        }
      });
      console.log(`[SharedEvents] Added ${sportsGames.length} Sports games from storage`);
    }
  } catch (error) {
    console.error("[SharedEvents] Error loading Sports bookmarks:", error);
  }
  
  // Get Instagram events from local storage
  try {
    const instagramBookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    if (instagramBookmarksData) {
      const instagramEvents: InstagramEvent[] = JSON.parse(instagramBookmarksData);
      instagramEvents.forEach((event) => {
        allEventsMap.set(`instagram-${event.id}`, { event, eventType: 'instagram' });
      });
      console.log(`[SharedEvents] Loaded ${instagramEvents.length} Instagram events from storage`);
    }
  } catch (error) {
    console.error("[SharedEvents] Error loading Instagram events:", error);
  }
  
  console.log(`[SharedEvents] Total events in map: ${allEventsMap.size}`);
  return allEventsMap;
}

/**
 * Get events that the other user has bookmarked
 * Fetches the other user's bookmarks from the backend and matches with available event data
 * @param otherUserId The backend user ID of the connected user
 */
export async function getSharedEvents(otherUserId?: number): Promise<SharedEvent[]> {
  console.log(`[SharedEvents] getSharedEvents called with otherUserId=${otherUserId}`);
  
  // If no other user specified, return empty
  if (!otherUserId) {
    console.log(`[SharedEvents] No otherUserId provided, returning empty array`);
    return [];
  }

  // Get current user's backend ID
  const myBackendUserId = await getStoredBackendUserId();
  if (!myBackendUserId) {
    console.log("[SharedEvents] No backend user ID found, returning empty array");
    return [];
  }

  // Fetch other user's bookmarks from backend
  const otherUserBookmarks = await fetchUserBookmarksFromBackend(otherUserId, myBackendUserId);
  
  if (otherUserBookmarks.length === 0) {
    console.log("[SharedEvents] Other user has no bookmarks");
    return [];
  }
  
  console.log(`[SharedEvents] Other user has ${otherUserBookmarks.length} bookmarks`);
  
  // Build a map of all available events
  const allEventsMap = await buildAllEventsMap();
  
  // Get current user's bookmarked event IDs for marking shared status
  const myBookmarkedEvents = await getBookmarkedEvents();
  const myGoingEvents = await getAllGoingEvents();
  const myEventIds = new Set<string>();
  
  myBookmarkedEvents.forEach(({ event, eventType }) => {
    myEventIds.add(getEventId(event, eventType));
  });
  myGoingEvents.forEach(({ event, eventType }) => {
    myEventIds.add(getEventId(event, eventType));
  });
  
  // Match other user's bookmarks with available event data
  const sharedEvents: SharedEvent[] = [];
  
  for (const bookmark of otherUserBookmarks) {
    const eventType = mapSourceToEventType(bookmark.source);
    const eventId = `${eventType}-${bookmark.eventId}`;
    
    const eventData = allEventsMap.get(eventId);
    if (eventData) {
      // Determine if this is a shared event (both users have it)
      const isShared = myEventIds.has(eventId);
      sharedEvents.push({
        event: eventData.event,
        eventType: eventData.eventType,
        sharedBy: isShared ? "both" : "them",
      });
    } else {
      console.log(`[SharedEvents] Could not find event data for: ${eventId}`);
    }
  }
  
  console.log(`[SharedEvents] Found ${sharedEvents.length} events from other user's bookmarks`);
  
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
