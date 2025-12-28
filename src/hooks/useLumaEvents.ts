import React from "react";
import { LumaEvent } from "../interfaces";

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
      
      const eventsRes = await fetch(
        `https://luma-events-inky.vercel.app/api/events/${city}`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      
      if (data.success && data.events) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching Luma events:", err);
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

