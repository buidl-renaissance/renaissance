import moment from 'moment';
import { DAEvent, LumaEvent, RAEvent, MeetupEvent, InstagramEvent } from "../interfaces";
import { SportsGame } from "../api/sports-games";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { schedulePushNotification } from "./notifications";

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
    // console.log("BOOKMARKS: ", bookmarks);
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
        
      }
    }
};

// Bookmark status for web events (Luma/RA/DA/Meetup/Sports/Instagram with URLs)
export const getBookmarkStatusForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup' | 'sports' | 'instagram'
): Promise<boolean> => {
  if (eventType === 'da' && 'id' in event) {
    // Use existing DA event bookmark system
    const result = await AsyncStorage.getItem(`Bookmark-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'luma' && 'apiId' in event) {
    // Check Luma event bookmarks
    const result = await AsyncStorage.getItem(`Bookmark-luma-${event.apiId}`);
    return result ? true : false;
  } else if (eventType === 'ra' && 'id' in event) {
    // Check RA event bookmarks
    const result = await AsyncStorage.getItem(`Bookmark-ra-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    // Check Meetup event bookmarks
    const meetupEvent = event as MeetupEvent;
    const result = await AsyncStorage.getItem(`Bookmark-meetup-${meetupEvent.eventId}`);
    return result ? true : false;
  } else if (eventType === 'sports' && 'id' in event) {
    // Check Sports game bookmarks
    const sportsGame = event as SportsGame;
    const result = await AsyncStorage.getItem(`Bookmark-sports-${sportsGame.id}`);
    return result ? true : false;
  } else if (eventType === 'instagram' && 'id' in event) {
    // Check Instagram event bookmarks
    const instagramEvent = event as InstagramEvent;
    const result = await AsyncStorage.getItem(`Bookmark-instagram-${instagramEvent.id}`);
    return result ? true : false;
  }
  return false;
};

// Toggle bookmark for web events (Luma/RA/DA/Meetup/Sports/Instagram with URLs)
export const toggleBookmarkForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup' | 'sports' | 'instagram'
): Promise<boolean> => {
  const isBookmarked = await getBookmarkStatusForWebEvent(event, eventType);

  if (eventType === 'da' && 'id' in event && 'title' in event) {
    // Use existing DA event bookmark system
    const daEvent = event as DAEvent;
    await toggleBookmark(daEvent);
    return !isBookmarked;
  } else if (eventType === 'luma' && 'apiId' in event) {
    // Handle Luma events - store full event data
    const lumaEvent = event as LumaEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedLumaEvents');
    let bookmarkedLumaEvents: LumaEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark
      bookmarkedLumaEvents = bookmarkedLumaEvents.filter((e: LumaEvent) => e.apiId !== lumaEvent.apiId);
      await AsyncStorage.removeItem(`Bookmark-luma-${lumaEvent.apiId}`);
    } else {
      // Add bookmark
      bookmarkedLumaEvents.push(lumaEvent);
      await AsyncStorage.setItem(`Bookmark-luma-${lumaEvent.apiId}`, "1");
    }
    await AsyncStorage.setItem('BookmarkedLumaEvents', JSON.stringify(bookmarkedLumaEvents));
    return !isBookmarked;
  } else if (eventType === 'ra' && 'id' in event) {
    // Handle RA events - store full event data
    const raEvent = event as RAEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedRAEvents');
    let bookmarkedRAEvents: RAEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark
      bookmarkedRAEvents = bookmarkedRAEvents.filter((e: RAEvent) => e.id !== raEvent.id);
      await AsyncStorage.removeItem(`Bookmark-ra-${raEvent.id}`);
    } else {
      // Add bookmark
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
    return !isBookmarked;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    // Handle Meetup events - store full event data
    const meetupEvent = event as MeetupEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedMeetupEvents');
    let bookmarkedMeetupEvents: MeetupEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark
      bookmarkedMeetupEvents = bookmarkedMeetupEvents.filter((e: MeetupEvent) => e.eventId !== meetupEvent.eventId);
      await AsyncStorage.removeItem(`Bookmark-meetup-${meetupEvent.eventId}`);
    } else {
      // Add bookmark
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
    return !isBookmarked;
  } else if (eventType === 'sports' && 'id' in event) {
    // Handle Sports games - store full game data
    const sportsGame = event as SportsGame;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedSportsGames');
    let bookmarkedSportsGames: SportsGame[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark
      bookmarkedSportsGames = bookmarkedSportsGames.filter((g: SportsGame) => g.id !== sportsGame.id);
      await AsyncStorage.removeItem(`Bookmark-sports-${sportsGame.id}`);
    } else {
      // Add bookmark
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
    return !isBookmarked;
  } else if (eventType === 'instagram' && 'id' in event) {
    // Handle Instagram events - store full event data
    const instagramEvent = event as InstagramEvent;
    const bookmarksData = await AsyncStorage.getItem('BookmarkedInstagramEvents');
    let bookmarkedInstagramEvents: InstagramEvent[] = bookmarksData ? JSON.parse(bookmarksData) : [];

    if (isBookmarked) {
      // Remove bookmark
      bookmarkedInstagramEvents = bookmarkedInstagramEvents.filter((e: InstagramEvent) => e.id !== instagramEvent.id);
      await AsyncStorage.removeItem(`Bookmark-instagram-${instagramEvent.id}`);
    } else {
      // Add bookmark
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
export const getCachedBookmarkedEvents = async (): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' | 'sports' | 'instagram' }> | null> => {
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
  events: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' | 'sports' | 'instagram' }>
): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHED_BOOKMARKED_EVENTS_KEY, JSON.stringify(events));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error caching bookmarked events:", error);
  }
};

// Get all bookmarked events (DA by ID lookup, Luma/RA/Meetup/Sports/Instagram from stored data)
export const getBookmarkedEvents = async (useCache: boolean = true): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' | 'sports' | 'instagram' }>> => {
  // Try to get from cache first if requested
  if (useCache) {
    const cached = await getCachedBookmarkedEvents();
    if (cached) {
      return cached;
    }
  }

  const bookmarkedEvents: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' | 'sports' | 'instagram' }> = [];

  // Get DA event IDs
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

  // Get Luma events
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

  // Get RA events
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

  // Get Meetup events
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

  // Get Sports games
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

  // Get Instagram events
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

// Remove bookmarked event
export const removeBookmarkedEvent = async (
  eventId: string | number,
  eventType: 'luma' | 'ra' | 'da' | 'meetup' | 'sports' | 'instagram'
): Promise<void> => {
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
