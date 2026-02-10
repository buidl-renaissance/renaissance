import React from "react";

const ETH_DENVER_EVENTS_URL = "https://eth-denver-psi.vercel.app/api/events";

export interface EthDenverEvent {
  id: string;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  eventName: string;
  organizer: string | null;
  venue: string;
  registrationUrl: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  events: EthDenverEvent[];
}

export function useEthDenverEvents(): {
  events: EthDenverEvent[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [events, setEvents] = React.useState<EthDenverEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(ETH_DENVER_EVENTS_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch ETH Denver events: ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      setEvents(data.events ?? []);
      setError(null);
    } catch (err) {
      console.error("Error fetching ETH Denver events:", err);
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
