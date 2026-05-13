/**
 * Resident Advisor (RA) Events Poller
 * Fetches events from RA API and normalizes them
 */

import { RAEvent, PollResult, RenaissanceEventInput } from '../types';
import { normalizeRAEvent, filterUpcomingEvents, deduplicateEvents } from '../normalize';
import { bulkUpsertEvents } from '../storage';
import { logger } from '../logger';

const RA_API_URL = process.env.RA_API_URL || 'https://ra-events.vercel.app';

interface RAApiResponse {
  success: boolean;
  events: RAEvent[];
  total?: number;
  error?: string;
}

/**
 * Fetch upcoming events from RA
 */
async function fetchRAEvents(type: 'upcoming' | 'nye' = 'upcoming'): Promise<RAEvent[]> {
  try {
    const response = await fetch(`${RA_API_URL}/api/events/${type}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error(`Failed to fetch RA events: HTTP ${response.status}`, 'ra');
      return [];
    }

    const data: RAApiResponse = await response.json();
    
    if (!data.success || !Array.isArray(data.events)) {
      logger.warn(`RA API returned unsuccessful response`, 'ra', { data });
      return [];
    }

    logger.info(`Fetched ${data.events.length} events from RA (${type})`, 'ra');
    return data.events;
  } catch (error) {
    logger.pollError('ra', error);
    return [];
  }
}

/**
 * Poll RA for events
 */
export async function pollRAEvents(): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  logger.pollStart('ra');

  let allEvents: RAEvent[] = [];

  try {
    const upcomingEvents = await fetchRAEvents('upcoming');
    allEvents = allEvents.concat(upcomingEvents);
  } catch (error) {
    const errorMsg = `Failed to fetch upcoming: ${error instanceof Error ? error.message : String(error)}`;
    errors.push(errorMsg);
    logger.error(errorMsg, 'ra');
  }

  allEvents = deduplicateEvents(allEvents) as RAEvent[];

  const upcomingEvents = filterUpcomingEvents(
    allEvents.map(e => ({ ...e, startTime: e.date }))
  ) as (RAEvent & { startTime: string })[];

  logger.info(`Processing ${upcomingEvents.length} upcoming events after deduplication`, 'ra');

  const normalizedEvents: RenaissanceEventInput[] = upcomingEvents
    .map(event => {
      try {
        return normalizeRAEvent(event);
      } catch (error) {
        errors.push(`Failed to normalize event ${event.id}: ${error}`);
        return null;
      }
    })
    .filter((e): e is RenaissanceEventInput => e !== null);

  const upsertResult = await bulkUpsertEvents(normalizedEvents);
  errors.push(...upsertResult.errors);

  const duration = Date.now() - startTime;
  logger.pollComplete('ra', normalizedEvents.length, duration);

  return {
    source: 'ra',
    success: errors.length === 0,
    eventsProcessed: normalizedEvents.length,
    eventsUpserted: upsertResult.upserted,
    errors,
    duration,
    timestamp: new Date().toISOString(),
  };
}
