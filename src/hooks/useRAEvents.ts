import React from "react";
import { RAEvent } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

export interface RAEventsQuery {
  dateFrom?: string;
  dateTo?: string;
  // Optional type hint for which RA endpoint to hit.
  // "upcoming" -> /api/events/upcoming (default)
  // "nye"      -> /api/events/nye
  type?: "upcoming" | "nye";
}

interface RAEventsCacheData {
  events: RAEvent[];
  total: number;
}

export const useRAEvents = (query?: RAEventsQuery) => {
  const [events, setEvents] = React.useState<RAEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [total, setTotal] = React.useState<number>(0);
  
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const endpointType = query?.type === "nye" ? "nye" : "upcoming";
      const cacheKey = `ra_events_${endpointType}`;
      
      // Load cached data first
      const cached = await getCachedData<RAEventsCacheData>(cacheKey);
      if (cached) {
        setEvents(cached.events);
        setTotal(cached.total);
      }
      
      const eventsRes = await fetch(
        `https://ra-events.vercel.app/api/events/${endpointType}`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch RA events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      
      if (data.success && data.events) {
        const eventsData = data.events;
        const totalCount = data.total || data.events.length;
        setEvents(eventsData);
        setTotal(totalCount);
        await setCachedData(cacheKey, { events: eventsData, total: totalCount });
      } else {
        setEvents([]);
        setTotal(0);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching RA events:", err);
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

  return { events, loading, error, total, refresh: updateEvents };
};

