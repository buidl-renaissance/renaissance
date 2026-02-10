import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";
import { EventType } from "./eventDates";

/**
 * Generate a unique key for an event based on its type and ID
 */
export const getEventKey = (
  item: any,
  index: number,
  eventType?: EventType
): string => {
  const type = eventType || (item as any).eventType;

  switch (type) {
    case "da":
      return `da-${(item as DAEvent).id}`;
    case "luma":
      return `luma-${(item as LumaEvent).apiId}`;
    case "ra":
      return `ra-${(item as RAEvent).id}`;
    case "meetup":
      return `meetup-${(item as MeetupEvent).eventId}`;
    case "sports":
      return `sports-${(item as SportsGame).id}`;
    case "instagram":
      return `instagram-${(item as InstagramEvent).id}`;
    case "eth-denver":
      return `eth-denver-${(item as any).id}`;
    default:
      return `event-${index}`;
  }
};

