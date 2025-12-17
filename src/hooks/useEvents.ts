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
      console.log("Fetching Detroit Art events...");
      console.log("PARAMS: ", params.toString());
      const eventsRes = await fetch(
        `https://api.detroiter.network/api/events?${params.toString()}`
      );
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
      console.log(`Fetched ${fetchedEvents.data?.length || 0} Detroit Art events`);
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
