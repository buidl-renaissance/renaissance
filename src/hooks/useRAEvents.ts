import React from "react";
import { RAEvent } from "../interfaces";

export interface RAEventsQuery {
  dateFrom?: string;
  dateTo?: string;
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
      console.log("Fetching RA events...");
      
      const eventsRes = await fetch(
        `https://ra-events.vercel.app/api/events/upcoming`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch RA events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      
      if (data.success && data.events) {
        setEvents(data.events);
        setTotal(data.total || data.events.length);
        console.log(`Fetched ${data.events.length} RA events (${data.total} total)`);
      } else {
        setEvents([]);
        setTotal(0);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching RA events:", err);
      setError(err as Error);
      setEvents([]);
      setTotal(0);
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

  return { events, loading, error, total, refresh: updateEvents };
};

