import React from "react";
import { RAEvent } from "../interfaces";
import {
  getFeaturedRAEvents,
  addFeaturedRAEvent,
  removeFeaturedRAEvent,
} from "../api/featured-events";

export const useFeaturedRAEvents = () => {
  const [featuredEventIds, setFeaturedEventIds] = React.useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const hasFetchedRef = React.useRef(false);

  const fetchFeaturedEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const eventIds = await getFeaturedRAEvents();
      setFeaturedEventIds(new Set(eventIds));
      console.log(`Fetched ${eventIds.length} featured RA events`);
    } catch (error) {
      console.error("Error fetching featured RA events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchFeaturedEvents();
  }, [fetchFeaturedEvents]);

  const isFeatured = React.useCallback(
    (eventId: string): boolean => {
      return featuredEventIds.has(eventId);
    },
    [featuredEventIds]
  );

  const toggleFeatured = React.useCallback(
    async (event: RAEvent): Promise<boolean> => {
      const eventId = event.id;
      const wasFeatured = featuredEventIds.has(eventId);

      // Optimistic update
      setFeaturedEventIds((prev) => {
        const next = new Set(prev);
        if (wasFeatured) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        return next;
      });

      // Sync with backend
      let success: boolean;
      if (wasFeatured) {
        success = await removeFeaturedRAEvent(eventId);
        console.log(`Removed featured: ${event.title}`);
      } else {
        success = await addFeaturedRAEvent(event);
        console.log(`Added featured: ${event.title}`);
      }

      // Revert on failure
      if (!success) {
        setFeaturedEventIds((prev) => {
          const next = new Set(prev);
          if (wasFeatured) {
            next.add(eventId);
          } else {
            next.delete(eventId);
          }
          return next;
        });
        return false;
      }

      return true;
    },
    [featuredEventIds]
  );

  return {
    isFeatured,
    toggleFeatured,
    loading,
    refresh: fetchFeaturedEvents,
  };
};

