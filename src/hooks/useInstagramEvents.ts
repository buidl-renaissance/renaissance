import React from "react";
import { InstagramEvent } from "../interfaces";

export interface InstagramEventsQuery {
  // Future query parameters can be added here
}

export const useInstagramEvents = (query?: InstagramEventsQuery) => {
  const [events, setEvents] = React.useState<InstagramEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const eventsRes = await fetch(
        `https://instagram.builddetroit.xyz/api/events/upcoming`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch Instagram events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      
      if (data.success && data.data) {
        setEvents(data.data);
      } else {
        setEvents([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching Instagram events:", err);
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

