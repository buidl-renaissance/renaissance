import moment from 'moment';
import { DAEvent, LumaEvent, RAEvent, MeetupEvent, InstagramEvent } from "../interfaces";
import { SportsGame } from "../api/sports-games";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { schedulePushNotification } from "./notifications";
import {
  BookmarkSource,
  getBookmarksFromBackend,
  createBookmarkOnBackend,
  deleteBookmarkByEvent,
} from "../api/bookmarks";

// Local event type used throughout the app
export type LocalEventType = 'luma' | 'ra' | 'da' | 'meetup' | 'sports' | 'instagram';

// Auth storage key - must match Auth context
const AUTH_STORAGE_KEY = "AUTH_USER";

/**
 * Get the backend user ID from stored auth state
 * Returns undefined if not authenticated or no backend user ID
 */
async function getStoredBackendUserId(): Promise<number | undefined> {
  try {
    const savedAuth = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      return user?.local?.backendUserId;
    }
  } catch (error) {
    console.error("[Bookmarks] Error reading auth state:", error);
  }
  return undefined;
}

/**
 * Fire-and-forget: Create bookmark on backend without blocking
 * Logs errors but doesn't throw
 */
function syncBookmarkToBackendAsync(
  backendUserId: number,
  eventId: string,
  source: BookmarkSource
): void {
  createBookmarkOnBackend(backendUserId, eventId, source)
    .catch((error) => {
      console.error(`[Bookmarks] FAILED to sync to backend: ${source}/${eventId}`, error);
    });
}

/**
 * Fire-and-forget: Delete bookmark from backend without blocking
 * Logs errors but doesn't throw
 */
function deleteBookmarkFromBackendAsync(
  backendUserId: number,
  source: BookmarkSource,
  eventId: string
): void {
  deleteBookmarkByEvent(backendUserId, source, eventId)
    .catch((error) => {
      console.error(`[Bookmarks] FAILED to delete from backend: ${source}/${eventId}`, error);
    });
}

/**
 * Map local event types to backend bookmark sources
 * da -> custom (DA events are custom events)
 * All others map directly
 */
export function mapEventTypeToSource(eventType: LocalEventType): BookmarkSource {
  if (eventType === 'da') {
    return 'custom';
  }
  return eventType as BookmarkSource;
}

/**
 * Map backend bookmark source back to local event type
 */
export function mapSourceToEventType(source: BookmarkSource): LocalEventType {
  if (source === 'custom') {
    return 'da';
  }
  if (source === 'eventbrite') {
    // eventbrite not currently used locally, default to da/custom
    return 'da';
  }
  return source as LocalEventType;
}

/**
 * Get the event ID string for a given event and type
 */
function getEventIdString(
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: LocalEventType
): string {
  if (eventType === 'luma' && 'apiId' in event) {
    return (event as LumaEvent).apiId;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    return (event as MeetupEvent).eventId;
  } else if ('id' in event) {
    return String(event.id);
  }
  return '';
}

export const getBookmarkStatus = async (event: DAEvent): Promise<boolean> => {
    const result = await AsyncStorage.getItem(`Bookmark-${event.id}`);
    return result ? true : false;
};

export const getBookmarks = async (): Promise<number[]> => {
    const bookmarksData = (await AsyncStorage.getItem(`Bookmarks`)) as string;
    return JSON.parse(bookmarksData) ?? ([] as number[]);
}

export const toggleBookmark = async (event: DAEvent) => {
    const bookmarks = await getBookmarks();
    const isBookmarked = await getBookmarkStatus(event);
    const eventIdString = String(event.id);
    
    // Update local storage immediately (optimistic update)
    if (isBookmarked) {
      const result = bookmarks.filter((event_id: number) => {
        return event_id !== event.id;
      });
      await AsyncStorage.setItem("Bookmarks", JSON.stringify(result));
      await AsyncStorage.removeItem(`Bookmark-${event.id}`);
    } else {
      bookmarks.push(event.id);
      await AsyncStorage.setItem("Bookmarks", JSON.stringify(bookmarks));
      await AsyncStorage.setItem(`Bookmark-${event.id}`, "1");
      
      try {
        await schedulePushNotification({
          content: {
            title: "Event Starts in 1 Hour",
            body: event.title,
            data: {
              event,
            },
          },
          trigger: {
            date: moment(event.start_date).subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        // Ignore notification errors
      }
    }
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, 'custom', eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, 'custom');
        }
      }
    });
};

// Bookmark status for web events (Luma/RA/DA/Meetup/Sports/Instagram with URLs)
export const getBookmarkStatusForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: LocalEventType
): Promise<boolean> => {
  if (eventType === 'da' && 'id' in event) {
    const result = await AsyncStorage.getItem(`Bookmark-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'luma' && 'apiId' in event) {
    const result = await AsyncStorage.getItem(`Bookmark-luma-${event.apiId}`);
    return result ? true : false;
  } else if (eventType === 'ra' && 'id' in event) {
    const result = await AsyncStorage.getItem(`Bookmark-ra-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    const meetupEvent = event as MeetupEvent;
    const result = await AsyncStorage.getItem(`Bookmark-meetup-${meetupEvent.eventId}`);
    return result ? true : false;
  } else if (eventType === 'sports' && 'id' in event) {
    const sportsGame = event as SportsGame;
    const result = await AsyncStorage.getItem(`Bookmark-sports-${sportsGame.id}`);
    return result ? true : false;
  } else if (eventType === 'instagram' && 'id' in event) {
    const instagramEvent = event as InstagramEvent;
    const result = await AsyncStorage.getItem(`Bookmark-instagram-${instagramEvent.id}`);
    return result ? true : false;
  }
  return false;
};

/**
 * Toggle bookmark for web events with hybrid backend/local storage
 * Updates local storage immediately (optimistic), then syncs to backend in background
 * @param event The event to bookmark/unbookmark
 * @param eventType The type of event
 */
export const toggleBookmarkForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: LocalEventType
): Promise<boolean> => {
  const isBookmarked = await getBookmarkStatusForWebEvent(event, eventType);
  const eventIdString = getEventIdString(event, eventType);
  const backendSource = mapEventTypeToSource(eventType);

  if (eventType === 'da' && 'id' in event && 'title' in event) {
    const daEvent = event as DAEvent;
    await toggleBookmark(daEvent);
    return !isBookmarked;
  } else if (eventType === 'luma' && 'apiId' in event) {
    const lumaEvent = event as LumaEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    let bookmarkedLumaEvents: LumaEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      bookmarkedLumaEvents = bookmarkedLumaEvents.filter((e: LumaEvent) => e.apiId !== lumaEvent.apiId);
      await AsyncStorage.removeItem(`Bookmark-luma-${lumaEvent.apiId}`);
    } else {
      bookmarkedLumaEvents.push(lumaEvent);
      await AsyncStorage.setItem(`Bookmark-luma-${lumaEvent.apiId}`, "1");
    }
    await AsyncStorage.setItem('BookmarkedLumaEvents', JSON.stringify(bookmarkedLumaEvents));
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, backendSource);
        }
      }
    });
    
    return !isBookmarked;
  } else if (eventType === 'ra' && 'id' in event) {
    // Handle RA events - store full event data
    const raEvent = event as RAEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    let bookmarkedRAEvents: RAEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark locally (immediate)
      bookmarkedRAEvents = bookmarkedRAEvents.filter((e: RAEvent) => e.id !== raEvent.id);
      await AsyncStorage.removeItem(`Bookmark-ra-${raEvent.id}`);
    } else {
      // Add bookmark locally (immediate)
      bookmarkedRAEvents.push(raEvent);
      await AsyncStorage.setItem(`Bookmark-ra-${raEvent.id}`, "1");
      
      try {
        // Schedule notification for RA events
        const startTime = moment(raEvent.startTime);
        await schedulePushNotification({
          content: {
            title: "Event Starts in 1 Hour",
            body: raEvent.title,
            data: {
              event: raEvent,
              eventType: 'ra',
            },
          },
          trigger: {
            date: startTime.subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        // Ignore notification errors
      }
    }
    await AsyncStorage.setItem('BookmarkedRAEvents', JSON.stringify(bookmarkedRAEvents));
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, backendSource);
        }
      }
    });
    
    return !isBookmarked;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    // Handle Meetup events - store full event data
    const meetupEvent = event as MeetupEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    let bookmarkedMeetupEvents: MeetupEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark locally (immediate)
      bookmarkedMeetupEvents = bookmarkedMeetupEvents.filter((e: MeetupEvent) => e.eventId !== meetupEvent.eventId);
      await AsyncStorage.removeItem(`Bookmark-meetup-${meetupEvent.eventId}`);
    } else {
      // Add bookmark locally (immediate)
      bookmarkedMeetupEvents.push(meetupEvent);
      await AsyncStorage.setItem(`Bookmark-meetup-${meetupEvent.eventId}`, "1");
      
      try {
        // Schedule notification for Meetup events
        const startTime = moment(meetupEvent.dateTime);
        await schedulePushNotification({
          content: {
            title: "Event Starts in 1 Hour",
            body: meetupEvent.title,
            data: {
              event: meetupEvent,
              eventType: 'meetup',
            },
          },
          trigger: {
            date: startTime.subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        // Ignore notification errors
      }
    }
    await AsyncStorage.setItem('BookmarkedMeetupEvents', JSON.stringify(bookmarkedMeetupEvents));
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, backendSource);
        }
      }
    });
    
    return !isBookmarked;
  } else if (eventType === 'sports' && 'id' in event) {
    // Handle Sports games - store full game data
    const sportsGame = event as SportsGame;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    let bookmarkedSportsGames: SportsGame[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark locally (immediate)
      bookmarkedSportsGames = bookmarkedSportsGames.filter((g: SportsGame) => g.id !== sportsGame.id);
      await AsyncStorage.removeItem(`Bookmark-sports-${sportsGame.id}`);
    } else {
      // Add bookmark locally (immediate)
      bookmarkedSportsGames.push(sportsGame);
      await AsyncStorage.setItem(`Bookmark-sports-${sportsGame.id}`, "1");
      
      try {
        // Schedule notification for Sports games
        const startTime = moment(sportsGame.startTime);
        await schedulePushNotification({
          content: {
            title: "Game Starts in 1 Hour",
            body: `${sportsGame.awayTeam.shortDisplayName} @ ${sportsGame.homeTeam.shortDisplayName}`,
            data: {
              event: sportsGame,
              eventType: 'sports',
            },
          },
          trigger: {
            date: startTime.subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        // Ignore notification errors
      }
    }
    await AsyncStorage.setItem('BookmarkedSportsGames', JSON.stringify(bookmarkedSportsGames));
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, backendSource);
        }
      }
    });
    
    return !isBookmarked;
  } else if (eventType === 'instagram' && 'id' in event) {
    // Handle Instagram events - store full event data
    const instagramEvent = event as InstagramEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    let bookmarkedInstagramEvents: InstagramEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark locally (immediate)
      bookmarkedInstagramEvents = bookmarkedInstagramEvents.filter((e: InstagramEvent) => e.id !== instagramEvent.id);
      await AsyncStorage.removeItem(`Bookmark-instagram-${instagramEvent.id}`);
    } else {
      // Add bookmark locally (immediate)
      bookmarkedInstagramEvents.push(instagramEvent);
      await AsyncStorage.setItem(`Bookmark-instagram-${instagramEvent.id}`, "1");
      
      try {
        // Schedule notification for Instagram events
        const startTime = moment(instagramEvent.startDatetime);
        await schedulePushNotification({
          content: {
            title: "Event Starts in 1 Hour",
            body: instagramEvent.name,
            data: {
              event: instagramEvent,
              eventType: 'instagram',
            },
          },
          trigger: {
            date: startTime.subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        // Ignore notification errors
      }
    }
    await AsyncStorage.setItem('BookmarkedInstagramEvents', JSON.stringify(bookmarkedInstagramEvents));
    
    // Sync to backend in background (non-blocking)
    getStoredBackendUserId().then((backendUserId) => {
      if (backendUserId) {
        if (isBookmarked) {
          deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
        } else {
          syncBookmarkToBackendAsync(backendUserId, eventIdString, backendSource);
        }
      }
    });
    
    return !isBookmarked;
  }

  return false;
};

// Cache key for full bookmarked events
const CACHED_BOOKMARKED_EVENTS_KEY = 'CachedBookmarkedEvents';
const CACHE_TIMESTAMP_KEY = 'CachedBookmarkedEventsTimestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached bookmarked events if they exist and are fresh
 */
export const getCachedBookmarkedEvents = async (): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: LocalEventType }> | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHED_BOOKMARKED_EVENTS_KEY);
    const timestampStr = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !timestampStr) {
      return null;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp > CACHE_DURATION) {
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error reading cached bookmarked events:", error);
    return null;
  }
};

/**
 * Cache bookmarked events
 */
export const cacheBookmarkedEvents = async (
  events: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: LocalEventType }>
): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHED_BOOKMARKED_EVENTS_KEY, JSON.stringify(events));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error caching bookmarked events:", error);
  }
};

/**
 * Get bookmarked event IDs from backend
 * Returns a Set of "source/eventId" strings for quick lookup
 */
export const getBackendBookmarkIds = async (
  backendUserId: number
): Promise<Set<string>> => {
  try {
    const bookmarks = await getBookmarksFromBackend(backendUserId, backendUserId);
    return new Set(bookmarks.map(b => `${b.source}/${b.eventId}`));
  } catch (error) {
    console.error("Error fetching backend bookmarks:", error);
    return new Set();
  }
};

// Get all bookmarked events (DA by ID lookup, Luma/RA/Meetup/Sports/Instagram from stored data)
// With hybrid approach: tries backend first if authenticated, falls back to local
export const getBookmarkedEvents = async (
  useCache: boolean = true
): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: LocalEventType }>> => {
  // Try to get from cache first if requested
  if (useCache) {
    const cached = await getCachedBookmarkedEvents();
    if (cached) {
      return cached;
    }
  }

  const bookmarkedEvents: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: LocalEventType }> = [];
  
  // Get backend user ID for potential sync reference
  const backendUserId = await getStoredBackendUserId();
  
  // If we have a backend user ID, fetch backend bookmarks for reference
  // This helps ensure local and backend are in sync
  let backendBookmarkIds: Set<string> = new Set();
  if (backendUserId) {
    backendBookmarkIds = await getBackendBookmarkIds(backendUserId);
  }

  // Get DA event IDs from local storage
  const daBookmarkIds = await getBookmarks();
  
  // Fetch DA events from API
  try {
    const eventsRes = await fetch("https://api.detroiter.network/api/events");
    const fetchedEvents = await eventsRes.json();
    const daEvents: DAEvent[] = fetchedEvents.data || [];
    
    // Filter to only bookmarked DA events
    daEvents.forEach((event: DAEvent) => {
      if (daBookmarkIds.includes(event.id)) {
        bookmarkedEvents.push({ event, eventType: 'da' });
      }
    });
  } catch (error) {
    console.error("Error fetching DA events for bookmarks:", error);
  }

  // Get Luma events from local storage
  try {
    const lumaBookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    if (lumaBookmarksData) {
      const lumaEvents: LumaEvent[] = JSON.parse(lumaBookmarksData);
      lumaEvents.forEach((event: LumaEvent) => {
        bookmarkedEvents.push({ event, eventType: 'luma' });
      });
    }
  } catch (error) {
    console.error("Error loading Luma bookmarks:", error);
  }

  // Get RA events from local storage
  try {
    const raBookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    if (raBookmarksData) {
      const raEvents: RAEvent[] = JSON.parse(raBookmarksData);
      raEvents.forEach((event: RAEvent) => {
        bookmarkedEvents.push({ event, eventType: 'ra' });
      });
    }
  } catch (error) {
    console.error("Error loading RA bookmarks:", error);
  }

  // Get Meetup events from local storage
  try {
    const meetupBookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    if (meetupBookmarksData) {
      const meetupEvents: MeetupEvent[] = JSON.parse(meetupBookmarksData);
      meetupEvents.forEach((event: MeetupEvent) => {
        bookmarkedEvents.push({ event, eventType: 'meetup' });
      });
    }
  } catch (error) {
    console.error("Error loading Meetup bookmarks:", error);
  }

  // Get Sports games from local storage
  try {
    const sportsBookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    if (sportsBookmarksData) {
      const sportsGames: SportsGame[] = JSON.parse(sportsBookmarksData);
      sportsGames.forEach((game: SportsGame) => {
        bookmarkedEvents.push({ event: game, eventType: 'sports' });
      });
    }
  } catch (error) {
    console.error("Error loading Sports bookmarks:", error);
  }

  // Get Instagram events from local storage
  try {
    const instagramBookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    if (instagramBookmarksData) {
      const instagramEvents: InstagramEvent[] = JSON.parse(instagramBookmarksData);
      instagramEvents.forEach((event: InstagramEvent) => {
        bookmarkedEvents.push({ event, eventType: 'instagram' });
      });
    }
  } catch (error) {
    console.error("Error loading Instagram bookmarks:", error);
  }

  // Cache the results
  await cacheBookmarkedEvents(bookmarkedEvents);

  return bookmarkedEvents;
};

// Remove bookmarked event with hybrid backend/local approach
// Updates local storage immediately, then syncs to backend in background
export const removeBookmarkedEvent = async (
  eventId: string | number,
  eventType: LocalEventType
): Promise<void> => {
  const backendSource = mapEventTypeToSource(eventType);
  const eventIdString = String(eventId);

  // Sync deletion to backend in background (non-blocking)
  getStoredBackendUserId().then((backendUserId) => {
    if (backendUserId) {
      deleteBookmarkFromBackendAsync(backendUserId, backendSource, eventIdString);
    }
  });

  // Remove from local storage (immediate)
  if (eventType === 'da') {
    const bookmarks = await getBookmarks();
    const result = bookmarks.filter((id: number) => id !== eventId);
    await AsyncStorage.setItem("Bookmarks", JSON.stringify(result));
    await AsyncStorage.removeItem(`Bookmark-${eventId}`);
  } else if (eventType === 'luma') {
    const bookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    if (bookmarksData) {
      const bookmarkedEvents: LumaEvent[] = JSON.parse(bookmarksData);
      const filtered = bookmarkedEvents.filter((e: LumaEvent) => e.apiId !== eventId);
      await AsyncStorage.setItem('BookmarkedLumaEvents', JSON.stringify(filtered));
      await AsyncStorage.removeItem(`Bookmark-luma-${eventId}`);
    }
  } else if (eventType === 'ra') {
    const bookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    if (bookmarksData) {
      const bookmarkedEvents: RAEvent[] = JSON.parse(bookmarksData);
      const filtered = bookmarkedEvents.filter((e: RAEvent) => e.id !== eventId);
      await AsyncStorage.setItem('BookmarkedRAEvents', JSON.stringify(filtered));
      await AsyncStorage.removeItem(`Bookmark-ra-${eventId}`);
    }
  } else if (eventType === 'meetup') {
    const bookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    if (bookmarksData) {
      const bookmarkedEvents: MeetupEvent[] = JSON.parse(bookmarksData);
      const filtered = bookmarkedEvents.filter((e: MeetupEvent) => e.eventId !== eventId);
      await AsyncStorage.setItem('BookmarkedMeetupEvents', JSON.stringify(filtered));
      await AsyncStorage.removeItem(`Bookmark-meetup-${eventId}`);
    }
  } else if (eventType === 'sports') {
    const bookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    if (bookmarksData) {
      const bookmarkedGames: SportsGame[] = JSON.parse(bookmarksData);
      const filtered = bookmarkedGames.filter((g: SportsGame) => g.id !== eventId);
      await AsyncStorage.setItem('BookmarkedSportsGames', JSON.stringify(filtered));
      await AsyncStorage.removeItem(`Bookmark-sports-${eventId}`);
    }
  } else if (eventType === 'instagram') {
    const bookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    if (bookmarksData) {
      const bookmarkedEvents: InstagramEvent[] = JSON.parse(bookmarksData);
      const filtered = bookmarkedEvents.filter((e: InstagramEvent) => e.id !== eventId);
      await AsyncStorage.setItem('BookmarkedInstagramEvents', JSON.stringify(filtered));
      await AsyncStorage.removeItem(`Bookmark-instagram-${eventId}`);
    }
  }
};

/**
 * Sync all local bookmarks to the backend
 * Call this when user logs in or when you want to ensure backend is up to date
 */
export const syncLocalBookmarksToBackend = async (
  backendUserId: number
): Promise<{ synced: number; failed: number }> => {
  let synced = 0;
  let failed = 0;

  // Get existing backend bookmarks to avoid duplicates
  let existingBackendBookmarks: Set<string>;
  try {
    existingBackendBookmarks = await getBackendBookmarkIds(backendUserId);
  } catch (error) {
    console.error("Failed to fetch existing backend bookmarks:", error);
    return { synced: 0, failed: 0 };
  }

  // Helper to sync a single bookmark
  const syncBookmark = async (eventId: string, source: BookmarkSource) => {
    const bookmarkKey = `${source}/${eventId}`;
    if (existingBackendBookmarks.has(bookmarkKey)) {
      // Already exists on backend
      return;
    }

    try {
      await createBookmarkOnBackend(backendUserId, eventId, source);
      synced++;
    } catch (error) {
      console.log(`Failed to sync bookmark ${bookmarkKey}:`, error);
      failed++;
    }
  };

  // Sync DA events (stored as IDs)
  try {
    const daBookmarkIds = await getBookmarks();
    for (const id of daBookmarkIds) {
      await syncBookmark(String(id), 'custom');
    }
  } catch (error) {
    console.error("Error syncing DA bookmarks:", error);
  }

  // Sync Luma events
  try {
    const lumaBookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    if (lumaBookmarksData) {
      const lumaEvents: LumaEvent[] = JSON.parse(lumaBookmarksData);
      for (const event of lumaEvents) {
        await syncBookmark(event.apiId, 'luma');
      }
    }
  } catch (error) {
    console.error("Error syncing Luma bookmarks:", error);
  }

  // Sync RA events
  try {
    const raBookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    if (raBookmarksData) {
      const raEvents: RAEvent[] = JSON.parse(raBookmarksData);
      for (const event of raEvents) {
        await syncBookmark(event.id, 'ra');
      }
    }
  } catch (error) {
    console.error("Error syncing RA bookmarks:", error);
  }

  // Sync Meetup events
  try {
    const meetupBookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    if (meetupBookmarksData) {
      const meetupEvents: MeetupEvent[] = JSON.parse(meetupBookmarksData);
      for (const event of meetupEvents) {
        await syncBookmark(event.eventId, 'meetup');
      }
    }
  } catch (error) {
    console.error("Error syncing Meetup bookmarks:", error);
  }

  // Sync Sports games
  try {
    const sportsBookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    if (sportsBookmarksData) {
      const sportsGames: SportsGame[] = JSON.parse(sportsBookmarksData);
      for (const game of sportsGames) {
        await syncBookmark(String(game.id), 'sports');
      }
    }
  } catch (error) {
    console.error("Error syncing Sports bookmarks:", error);
  }

  // Sync Instagram events
  try {
    const instagramBookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    if (instagramBookmarksData) {
      const instagramEvents: InstagramEvent[] = JSON.parse(instagramBookmarksData);
      for (const event of instagramEvents) {
        await syncBookmark(String(event.id), 'instagram');
      }
    }
  } catch (error) {
    console.error("Error syncing Instagram bookmarks:", error);
  }

  console.log(`Bookmark sync complete: ${synced} synced, ${failed} failed`);
  return { synced, failed };
};
