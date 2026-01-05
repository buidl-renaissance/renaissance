import { getBookmarkedEvents } from "./bookmarks";
import { getAllGoingEvents } from "./rsvp";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";

export type SharedEvent = {
  event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent;
  eventType: "da" | "luma" | "ra" | "meetup" | "sports" | "instagram";
  sharedBy: "both" | "me" | "them"; // For future: track who has it
};

/**
 * Get events that are shared between the current user and a connection
 * For now, this returns the current user's bookmarked and "going" events
 * In a full implementation, you'd compare with the other user's events
 */
export async function getSharedEvents(): Promise<SharedEvent[]> {
  const bookmarkedEvents = await getBookmarkedEvents();
  const goingEvents = await getAllGoingEvents();

  // Combine and deduplicate
  const allEvents = new Map<string, SharedEvent>();

  // Add bookmarked events
  bookmarkedEvents.forEach(({ event, eventType }) => {
    const eventId = getEventId(event, eventType);
    if (!allEvents.has(eventId)) {
      allEvents.set(eventId, {
        event,
        eventType,
        sharedBy: "me", // Current user has this
      });
    }
  });

  // Add going events
  goingEvents.forEach(({ event, eventType }) => {
    const eventId = getEventId(event, eventType);
    if (!allEvents.has(eventId)) {
      allEvents.set(eventId, {
        event,
        eventType,
        sharedBy: "me", // Current user has this
      });
    }
  });

  return Array.from(allEvents.values());
}

/**
 * Get a unique ID for an event based on its type
 */
function getEventId(
  event: DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame | InstagramEvent,
  eventType: "da" | "luma" | "ra" | "meetup" | "sports" | "instagram"
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
