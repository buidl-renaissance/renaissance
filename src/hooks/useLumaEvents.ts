import React from "react";
import { LumaEvent } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

export interface LumaEventsQuery {
  city?: string;
}

export const useLumaEvents = (query?: LumaEventsQuery) => {
  const [events, setEvents] = React.useState<LumaEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  // Store city in ref to avoid re-fetching on every render
  const cityRef = React.useRef(query?.city || "detroit");
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const city = cityRef.current;
      const cacheKey = `luma_events_${city}`;
      
      // Load cached data first
      const cached = await getCachedData<LumaEvent[]>(cacheKey);
      if (cached) {
        setEvents(cached);
      }
      
      const eventsRes = await fetch(
        `https://luma-events-inky.vercel.app/api/events/${city}`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      const eventsData = data.success && data.events ? data.events : [];
      
      setEvents(eventsData);
      await setCachedData(cacheKey, eventsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching Luma events:", err);
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
    
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      updateEvents();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateEvents]);

  return { events, loading, error, refresh: updateEvents };
};

