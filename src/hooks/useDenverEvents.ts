import React from "react";

// Default to deployed denver-events app; override with EXPO_PUBLIC_DENVER_EVENTS_API_URL if needed
const DENVER_EVENTS_API_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_DENVER_EVENTS_API_URL) ||
  "https://denver-events.vercel.app";

export interface DenverEvent {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  eventName: string;
  organizer: string | null;
  venue: string;
  registrationUrl: string | null;
  imageUrl?: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  events: DenverEvent[];
}

export function useDenverEvents(): {
  events: DenverEvent[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [events, setEvents] = React.useState<DenverEvent[]>([]);
  const [loading, setLoading] = React.useState(!!DENVER_EVENTS_API_URL);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchEvents = React.useCallback(async () => {
    if (!DENVER_EVENTS_API_URL) {
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${DENVER_EVENTS_API_URL}/api/events`);
      if (!res.ok) {
        throw new Error(`Failed to fetch Denver events: ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      setEvents(data.events ?? []);
      setError(null);
    } catch (err) {
      console.error("Error fetching Denver events:", err);
      setError(err as Error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
}
