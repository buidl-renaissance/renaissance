import React from "react";
import { RenaissanceEvent } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

export const useRenaissanceEvents = () => {
  const [events, setEvents] = React.useState<RenaissanceEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const cacheKey = "renaissance_events";
      
      // Load cached data first
      const cached = await getCachedData<RenaissanceEvent[]>(cacheKey);
      if (cached) {
        setEvents(cached);
      }
      
      const eventsRes = await fetch(
        "https://events.builddetroit.xyz/api/events/upcoming"
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch Renaissance events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      const eventsData = data.events || [];
      
      setEvents(eventsData);
      await setCachedData(cacheKey, eventsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching Renaissance events:", err);
      // Only set error if we don't have any events (cached or otherwise)
      if (events.length === 0) {
        setError(err as Error);
      }
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
    
    // Refresh every 1 minute
    const interval = setInterval(() => {
      updateEvents();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [updateEvents]);

  return { events, loading, error, refresh: updateEvents };
};
