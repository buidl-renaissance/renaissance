import React from "react";
import { AppState, AppStateStatus } from "react-native";
import { RenaissanceEvent, RenaissanceEventPublisher } from "../interfaces";
import { getCachedData, setCachedData } from "../utils/eventCache";

// Publishers map type from API response
type PublishersMap = Record<string, RenaissanceEventPublisher>;

// Helper to generate a fingerprint of current events for comparison
const getEventsFingerprint = (events: RenaissanceEvent[]): string => {
  // Create a fingerprint from event IDs and their updatedAt timestamps
  return events
    .map((e) => `${e.id}:${e.updatedAt || ""}`)
    .sort()
    .join("|");
};

// Helper to merge publishers into events based on source field
const mergePublishersIntoEvents = (
  events: RenaissanceEvent[],
  publishers: PublishersMap
): RenaissanceEvent[] => {
  return events.map((event) => ({
    ...event,
    publisher: publishers[event.source] || undefined,
  }));
};

export const useRenaissanceEvents = () => {
  const [events, setEvents] = React.useState<RenaissanceEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);
  const currentFingerprintRef = React.useRef<string>("");
  const appStateRef = React.useRef<AppStateStatus>(AppState.currentState);

  // Full reload - fetches all events and updates state
  const updateEvents = React.useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const cacheKey = "renaissance_events";
      
      // Load cached data first (only on initial load)
      if (!hasFetchedRef.current) {
        const cached = await getCachedData<RenaissanceEvent[]>(cacheKey);
        if (cached) {
          setEvents(cached);
          currentFingerprintRef.current = getEventsFingerprint(cached);
        }
      }
      
      const eventsRes = await fetch(
        "https://events.builddetroit.xyz/api/events/upcoming"
      );
      
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch Renaissance events: ${eventsRes.status}`);
      }

      const data = await eventsRes.json();
      const rawEvents: RenaissanceEvent[] = data.events || [];
      const publishers: PublishersMap = data.publishers || {};
      
      // Merge publishers into events
      const eventsData = mergePublishersIntoEvents(rawEvents, publishers);
      
      // Update fingerprint and state
      currentFingerprintRef.current = getEventsFingerprint(eventsData);
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
  }, [events.length]);

  // Lightweight check - only fetches and compares, reloads if changed
  const checkForUpdates = React.useCallback(async () => {
    try {
      const eventsRes = await fetch(
        "https://events.builddetroit.xyz/api/events/upcoming"
      );
      
      if (!eventsRes.ok) {
        return; // Silently fail on background checks
      }

      const data = await eventsRes.json();
      const rawEvents: RenaissanceEvent[] = data.events || [];
      const publishers: PublishersMap = data.publishers || {};
      
      // Merge publishers into events
      const eventsData = mergePublishersIntoEvents(rawEvents, publishers);
      const newFingerprint = getEventsFingerprint(eventsData);
      
      // Only update if data has changed
      if (newFingerprint !== currentFingerprintRef.current) {
        console.log("[useRenaissanceEvents] Data changed, updating...");
        currentFingerprintRef.current = newFingerprint;
        setEvents(eventsData);
        await setCachedData("renaissance_events", eventsData);
      }
    } catch (err) {
      // Silently fail on background checks
      console.log("[useRenaissanceEvents] Background check failed:", err);
    }
  }, []);

  // Handle app state changes (foreground/background)
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App came to foreground from background
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("[useRenaissanceEvents] App came to foreground, refreshing...");
        updateEvents(false); // Don't show loading indicator on foreground refresh
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [updateEvents]);

  // Initial fetch and periodic background checks
  React.useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    updateEvents();
    
    // Check for updates every 30 seconds (lightweight check)
    const interval = setInterval(() => {
      checkForUpdates();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [updateEvents, checkForUpdates]);

  return { events, loading, error, refresh: updateEvents };
};
