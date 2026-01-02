import moment, { Moment } from "moment";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";

export type EventType =
  | "da"
  | "luma"
  | "ra"
  | "meetup"
  | "sports"
  | "instagram"
  | "flyer";

export type AnyEvent =
  | DAEvent
  | LumaEvent
  | RAEvent
  | MeetupEvent
  | SportsGame
  | InstagramEvent
  | any;

/**
 * Get the start date for an event based on its type
 */
export const getEventStartDate = (
  event: AnyEvent,
  eventType: EventType
): Moment | null => {
  switch (eventType) {
    case "da":
      return (event as DAEvent).start_date
        ? moment((event as DAEvent).start_date)
        : null;
    case "luma":
      return (event as LumaEvent).startAt
        ? moment((event as LumaEvent).startAt)
        : null;
    case "ra":
      return (event as RAEvent).startTime
        ? moment((event as RAEvent).startTime)
        : null;
    case "meetup":
      // MeetupEvent uses dateTime, but stored bookmarks might have startTime
      const meetupEvent = event as MeetupEvent & { startTime?: string };
      return meetupEvent.startTime
        ? moment(meetupEvent.startTime)
        : meetupEvent.dateTime
        ? moment(meetupEvent.dateTime)
        : null;
    case "sports":
      return (event as SportsGame).startTime
        ? moment((event as SportsGame).startTime)
        : null;
    case "instagram":
      return (event as InstagramEvent).startDatetime
        ? moment((event as InstagramEvent).startDatetime)
        : null;
    default:
      return null;
  }
};

/**
 * Get the end date for an event based on its type
 */
export const getEventEndDate = (
  event: AnyEvent,
  eventType: EventType
): Moment | null => {
  switch (eventType) {
    case "da":
      return (event as DAEvent).end_date
        ? moment((event as DAEvent).end_date)
        : null;
    case "luma":
      return (event as LumaEvent).endAt
        ? moment((event as LumaEvent).endAt)
        : null;
    case "ra":
      return (event as RAEvent).endTime
        ? moment((event as RAEvent).endTime)
        : null;
    case "meetup":
      // MeetupEvent uses dateTime, but stored bookmarks might have endTime
      const meetupEventEnd = event as MeetupEvent & { endTime?: string };
      if (meetupEventEnd.endTime) {
        return moment(meetupEventEnd.endTime);
      }
      // If no endTime, estimate 2 hours (matching MeetupEventCard logic)
      return meetupEventEnd.dateTime
        ? moment(meetupEventEnd.dateTime).add(2, "hours")
        : null;
    case "sports":
      // Sports games don't have explicit end dates, approximate as 3 hours
      return (event as SportsGame).startTime
        ? moment((event as SportsGame).startTime).add(3, "hours")
        : null;
    case "instagram":
      // Instagram events can have endDatetime, or approximate as 3 hours
      const instagramEvent = event as InstagramEvent;
      if (instagramEvent.endDatetime) {
        return moment(instagramEvent.endDatetime);
      }
      return instagramEvent.startDatetime
        ? moment(instagramEvent.startDatetime).add(3, "hours")
        : null;
    default:
      return null;
  }
};

