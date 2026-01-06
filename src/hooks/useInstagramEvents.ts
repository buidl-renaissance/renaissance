import React from "react";
import { InstagramEvent } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

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
      const cacheKey = 'instagram_events';
      
      // Load cached data first
      const cached = await getCachedData<InstagramEvent[]>(cacheKey);
      if (cached) {
        setEvents(cached);
      }
      
      const eventsRes = await fetch(
        `https://instagram.builddetroit.xyz/api/events/upcoming`
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch Instagram events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      const eventsData = data.success && data.data ? data.data : [];
      
      setEvents(eventsData);
      await setCachedData(cacheKey, eventsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching Instagram events:", err);
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

