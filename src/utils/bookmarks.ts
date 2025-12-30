import moment from 'moment';
import { DAEvent, LumaEvent, RAEvent, MeetupEvent } from "../interfaces";
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

// Bookmark status for web events (Luma/RA/DA/Meetup with URLs)
export const getBookmarkStatusForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup'
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
  }
  return false;
};

// Toggle bookmark for web events (Luma/RA/DA/Meetup with URLs)
export const toggleBookmarkForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup'
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
  }

  return false;
};

// Get all bookmarked events (DA by ID lookup, Luma/RA/Meetup from stored data)
export const getBookmarkedEvents = async (): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' }>> => {
  const bookmarkedEvents: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' }> = [];

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

  return bookmarkedEvents;
};

// Remove bookmarked event
export const removeBookmarkedEvent = async (
  eventId: string | number,
  eventType: 'luma' | 'ra' | 'da' | 'meetup'
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
  }
};
