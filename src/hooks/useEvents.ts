import React from "react";

import { DAEvent } from "../interfaces";

export interface EventsQuery {
  type?: string;
}

export const useEvents = (query?: EventsQuery) => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams(query);
      const eventsRes = await fetch(
        `https://api.detroiter.network/api/events?${params.toString()}`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch DA events: ${eventsRes.status}`);
      }

      const fetchedEvents = await eventsRes.json();
      
      if (fetchedEvents.data) {
        setEvents(fetchedEvents.data);
      } else {
        setEvents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching Detroit Art events:", err);
      setError(err as Error);
      setEvents([]);
    } finally {
      setLoading(false);
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

  return { events, loading, error, refresh: updateEvents };
};
