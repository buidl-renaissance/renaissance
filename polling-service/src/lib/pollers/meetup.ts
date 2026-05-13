/**
 * Meetup Events Poller
 * Fetches events from Meetup API and normalizes them
 */

import { MeetupEvent, PollResult, RenaissanceEventInput } from '../types';
import { normalizeMeetupEvent, filterUpcomingEvents, deduplicateEvents } from '../normalize';
import { bulkUpsertEvents } from '../storage';
import { logger } from '../logger';

const MEETUP_API_URL = process.env.MEETUP_API_URL || 'https://meetup.builddetroit.xyz';

interface MeetupApiResponse {
  events: MeetupEvent[];
  error?: string;
}

/**
 * Fetch events from Meetup
 */
async function fetchMeetupEvents(): Promise<MeetupEvent[]> {
  try {
    const response = await fetch(`${MEETUP_API_URL}/api/meetup/events`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error(`Failed to fetch Meetup events: HTTP ${response.status}`, 'meetup');
      return [];
    }

    const data: MeetupApiResponse = await response.json();
    
    if (!Array.isArray(data.events)) {
      logger.warn(`Meetup API returned unexpected response format`, 'meetup', { data });
      return [];
    }

    logger.info(`Fetched ${data.events.length} events from Meetup`, 'meetup');
    return data.events;
  } catch (error) {
    logger.pollError('meetup', error);
    return [];
  }
}

/**
 * Poll Meetup for events
 */
export async function pollMeetupEvents(): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  logger.pollStart('meetup');

  let allEvents: MeetupEvent[] = [];

  try {
    const events = await fetchMeetupEvents();
    allEvents = events;
  } catch (error) {
    const errorMsg = `Failed to fetch events: ${error instanceof Error ? error.message : String(error)}`;
    errors.push(errorMsg);
    logger.error(errorMsg, 'meetup');
  }

  allEvents = deduplicateEvents(allEvents) as MeetupEvent[];

  const upcomingEvents = filterUpcomingEvents(
    allEvents.map(e => ({ ...e, startTime: e.dateTime }))
  ) as (MeetupEvent & { startTime: string })[];

  logger.info(`Processing ${upcomingEvents.length} upcoming events after deduplication`, 'meetup');

  const normalizedEvents: RenaissanceEventInput[] = upcomingEvents
    .map(event => {
      try {
        return normalizeMeetupEvent(event);
      } catch (error) {
        errors.push(`Failed to normalize event ${event.eventId}: ${error}`);
        return null;
      }
    })
    .filter((e): e is RenaissanceEventInput => e !== null);

  const upsertResult = await bulkUpsertEvents(normalizedEvents);
  errors.push(...upsertResult.errors);

  const duration = Date.now() - startTime;
  logger.pollComplete('meetup', normalizedEvents.length, duration);

  return {
    source: 'meetup',
    success: errors.length === 0,
    eventsProcessed: normalizedEvents.length,
    eventsUpserted: upsertResult.upserted,
    errors,
    duration,
    timestamp: new Date().toISOString(),
  };
}
