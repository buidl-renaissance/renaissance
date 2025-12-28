import React from "react";

import { DAEvent } from "../interfaces";

export interface EventsQuery {
  type?: string;
}

export const useEvents = (query?: EventsQuery) => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      const params = new URLSearchParams(query);
      const eventsRes = await fetch(
        `https://api.detroiter.network/api/events?${params.toString()}`
      );
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    } catch (err) {
      console.error("Error fetching Detroit Art events:", err);
    }
  }, [query]);

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

  return [events];
};
