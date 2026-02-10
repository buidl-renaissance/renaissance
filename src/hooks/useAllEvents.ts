import React from "react";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
  RenaissanceEvent,
  RenaissanceEventPublisher,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";
import { getCachedData, setCachedData } from "../utils/eventCache";

const EVENTS_ALL_URL = "https://events.builddetroit.xyz/api/events/all";

type PublishersMap = Record<string, RenaissanceEventPublisher>;

const mergePublishersIntoEvents = (
  events: RenaissanceEvent[],
  publishers: PublishersMap
): RenaissanceEvent[] => {
  return events.map((event) => ({
    ...event,
    publisher: publishers[event.source] || undefined,
  }));
};

export interface AllEventsResponse {
  da: { data: DAEvent[] };
  luma: { success: boolean; events: LumaEvent[] };
  ra: { success: boolean; events: RAEvent[]; total: number };
  meetup: { events: MeetupEvent[] };
  sports: { games: SportsGame[] };
  instagram: { success: boolean; data: InstagramEvent[] };
  renaissance: { events: RenaissanceEvent[]; publishers: PublishersMap };
  timestamp: string;
}

export interface UseAllEventsResult {
  events: DAEvent[];
  lumaEvents: LumaEvent[];
  raEvents: RAEvent[];
  raTotal: number;
  meetupEvents: MeetupEvent[];
  sportsGames: SportsGame[];
  instagramEvents: InstagramEvent[];
  renaissanceEvents: RenaissanceEvent[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const CACHE_KEY = "all_events";

// Stable empty arrays so dependents don't see a new reference every render (avoids update loops)
const EMPTY_DA: DAEvent[] = [];
const EMPTY_LUMA: LumaEvent[] = [];
const EMPTY_RA: RAEvent[] = [];
const EMPTY_MEETUP: MeetupEvent[] = [];
const EMPTY_SPORTS: SportsGame[] = [];
const EMPTY_INSTAGRAM: InstagramEvent[] = [];
const EMPTY_RENAISSANCE: RenaissanceEvent[] = [];

export function useAllEvents(): UseAllEventsResult {
  const [data, setData] = React.useState<AllEventsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const updateEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      if (!hasFetchedRef.current) {
        const cached = await getCachedData<AllEventsResponse>(CACHE_KEY);
        if (cached) {
          setData(cached);
        }
      }

      const res = await fetch(EVENTS_ALL_URL);
      if (!res.ok) {
        throw new Error(`Failed to fetch events: ${res.status}`);
      }
      const raw: AllEventsResponse = await res.json();

      const renaissanceEvents = mergePublishersIntoEvents(
        raw.renaissance?.events ?? [],
        raw.renaissance?.publishers ?? {}
      );
      const payload: AllEventsResponse = {
        ...raw,
        renaissance: {
          ...raw.renaissance,
          events: renaissanceEvents,
        },
      };

      setData(payload);
      await setCachedData(CACHE_KEY, payload);
      setError(null);
    } catch (err) {
      console.error("Error fetching all events:", err);
      if (!data) {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    updateEvents();
    const interval = setInterval(updateEvents, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateEvents]);

  return {
    events: data?.da?.data ?? EMPTY_DA,
    lumaEvents: data?.luma?.events ?? EMPTY_LUMA,
    raEvents: data?.ra?.events ?? EMPTY_RA,
    raTotal: data?.ra?.total ?? 0,
    meetupEvents: data?.meetup?.events ?? EMPTY_MEETUP,
    sportsGames: data?.sports?.games ?? EMPTY_SPORTS,
    instagramEvents: data?.instagram?.data ?? EMPTY_INSTAGRAM,
    renaissanceEvents: data?.renaissance?.events ?? EMPTY_RENAISSANCE,
    loading,
    error,
    refresh: updateEvents,
  };
}
