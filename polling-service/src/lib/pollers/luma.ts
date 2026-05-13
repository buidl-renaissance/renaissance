/**
 * Luma Events Poller
 * Fetches events from Luma API and normalizes them
 */

import { LumaEvent, PollResult, RenaissanceEventInput } from '../types';
import { normalizeLumaEvent, filterUpcomingEvents, deduplicateEvents } from '../normalize';
import { bulkUpsertEvents } from '../storage';
import { logger } from '../logger';

const LUMA_API_URL = process.env.LUMA_API_URL || 'https://luma-events-inky.vercel.app';

const DEFAULT_CITIES = ['detroit', 'ann-arbor', 'chicago'];

interface LumaApiResponse {
  success: boolean;
  events: LumaEvent[];
  error?: string;
}

/**
 * Fetch events from Luma for a specific city
 */
async function fetchLumaEventsForCity(city: string): Promise<LumaEvent[]> {
  try {
    const response = await fetch(`${LUMA_API_URL}/api/events/${city}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error(`Failed to fetch Luma events for ${city}: HTTP ${response.status}`, 'luma');
      return [];
    }

    const data: LumaApiResponse = await response.json();
    
    if (!data.success || !Array.isArray(data.events)) {
      logger.warn(`Luma API returned unsuccessful response for ${city}`, 'luma', { data });
      return [];
    }

    logger.info(`Fetched ${data.events.length} events from Luma for ${city}`, 'luma');
    return data.events;
  } catch (error) {
    logger.pollError('luma', error);
    return [];
  }
}

/**
 * Poll all configured cities for Luma events
 */
export async function pollLumaEvents(
  cities: string[] = DEFAULT_CITIES
): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  logger.pollStart('luma');

  let allEvents: LumaEvent[] = [];

  for (const city of cities) {
    try {
      const cityEvents = await fetchLumaEventsForCity(city);
      allEvents = allEvents.concat(cityEvents);
    } catch (error) {
      const errorMsg = `Failed to fetch ${city}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      logger.error(errorMsg, 'luma');
    }
  }

  allEvents = deduplicateEvents(allEvents) as LumaEvent[];
  
  const upcomingEvents = filterUpcomingEvents(
    allEvents.map(e => ({ ...e, startTime: e.startAt }))
  ) as (LumaEvent & { startTime: string })[];

  logger.info(`Processing ${upcomingEvents.length} upcoming events after deduplication`, 'luma');

  const normalizedEvents: RenaissanceEventInput[] = upcomingEvents
    .map(event => {
      try {
        return normalizeLumaEvent(event);
      } catch (error) {
        errors.push(`Failed to normalize event ${event.apiId}: ${error}`);
        return null;
      }
    })
    .filter((e): e is RenaissanceEventInput => e !== null);

  const upsertResult = await bulkUpsertEvents(normalizedEvents);
  errors.push(...upsertResult.errors);

  const duration = Date.now() - startTime;
  logger.pollComplete('luma', normalizedEvents.length, duration);

  return {
    source: 'luma',
    success: errors.length === 0,
    eventsProcessed: normalizedEvents.length,
    eventsUpserted: upsertResult.upserted,
    errors,
    duration,
    timestamp: new Date().toISOString(),
  };
}
