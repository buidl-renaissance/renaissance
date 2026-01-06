import React from "react";

import { DAEvent } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

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
      const cacheKey = `da_events_${JSON.stringify(query || {})}`;
      
      // Load cached data first
      const cached = await getCachedData<DAEvent[]>(cacheKey);
      if (cached) {
        setEvents(cached);
      }
      
      const params = new URLSearchParams(query);
      const eventsRes = await fetch(
        `https://api.detroiter.network/api/events?${params.toString()}`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch DA events: ${eventsRes.status}`);
      }

      const fetchedEvents = await eventsRes.json();
      const eventsData = fetchedEvents.data || [];
      
      setEvents(eventsData);
      await setCachedData(cacheKey, eventsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching Detroit Art events:", err);
      // Only set error if we don't have any events (cached or otherwise)
      if (events.length === 0) {
        setError(err as Error);
      }
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
