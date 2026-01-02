import moment, { Moment } from "moment";
import { getEventStartDate, getEventEndDate, EventType, AnyEvent } from "./eventDates";

export interface EventGroup {
  data: any[];
  title: string;
  subtitle: string;
  sortDate: number;
  dateKey: string;
}

export interface TypedEvent {
  event: AnyEvent;
  eventType: EventType;
}

/**
 * Group events by date and sort them
 */
export const groupEventsByDate = (
  events: TypedEvent[],
  options: {
    filterEnded?: boolean; // Only include events that haven't ended
    endDateThreshold?: Moment; // Custom threshold for "ended" check
  } = {}
): EventGroup[] => {
  const { filterEnded = false, endDateThreshold } = options;
  const groups: { [key: string]: EventGroup } = {};

  events.forEach(({ event, eventType }) => {
    const start = getEventStartDate(event, eventType);
    if (!start || !start.isValid()) {
      return; // Skip invalid dates
    }

    // Check if event has ended
    if (filterEnded) {
      const end = getEventEndDate(event, eventType);
      const threshold = endDateThreshold || moment();
      if (end && end.isBefore(threshold)) {
        return; // Skip ended events
      }
    }

    const dateKey = start.format("YYYY-MM-DD");
    const date = start.format("MMMM Do");
    const subtitle = start.format("dddd");

    if (!groups[dateKey]) {
      groups[dateKey] = {
        title: date,
        subtitle: subtitle,
        data: [],
        sortDate: start.valueOf(),
        dateKey: dateKey,
      };
    }

    // Add event with eventType for rendering
    groups[dateKey].data.push({ ...event, eventType });
  });

  // Sort events within each group by start time
  Object.values(groups).forEach((group) => {
    group.data.sort((a: any, b: any) => {
      const aStart = getEventStartDate(a, a.eventType);
      const bStart = getEventStartDate(b, b.eventType);

      if (!aStart || !aStart.isValid()) {
        return 1;
      }
      if (!bStart || !bStart.isValid()) {
        return -1;
      }

      return aStart.diff(bStart);
    });
  });

  // Sort groups by date chronologically
  const groupsArray = Object.values(groups);
  groupsArray.sort((a, b) => a.sortDate - b.sortDate);

  return groupsArray;
};

