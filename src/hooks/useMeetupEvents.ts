import React from "react";
import { MeetupEvent } from "../interfaces";

export interface MeetupEventsQuery {
  limit?: number;
  offset?: number;
}

export const useMeetupEvents = (query?: MeetupEventsQuery) => {
  const [events, setEvents] = React.useState<MeetupEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const eventsRes = await fetch(
        `https://meetup.builddetroit.xyz/api/meetup/events`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch Meetup events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      
      if (data.events) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching Meetup events:", err);
      setError(err as Error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    updateEvents();
    
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      updateEvents();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateEvents]);

  return { events, loading, error, refresh: updateEvents };
};

