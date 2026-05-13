/**
 * Event normalization utilities
 * Converts events from various sources into the Renaissance event schema
 */

import { 
  RenaissanceEventInput, 
  LumaEvent, 
  RAEvent, 
  MeetupEvent,
  EventSource 
} from './types';

/**
 * Normalize a Luma event to Renaissance schema
 */
export function normalizeLumaEvent(event: LumaEvent): RenaissanceEventInput {
  const location = buildLocation(
    event.addressDescription,
    event.fullAddress,
    event.city,
    event.region
  );

  const hostName = event.hosts?.[0]?.name || 'Unknown Host';

  return {
    name: event.name,
    location: location || 'Online',
    startTime: event.startAt,
    endTime: event.endAt,
    flyerImage: event.coverUrl || undefined,
    metadata: {
      description: undefined,
      host: {
        name: hostName,
        username: event.hosts?.[0]?.username || undefined,
      },
      venue: event.fullAddress ? {
        name: event.addressDescription || location,
        address: event.fullAddress,
        city: event.city || undefined,
      } : undefined,
      ticketPrice: event.isFree ? 'Free' : (event.ticketPrice ? String(event.ticketPrice) : undefined),
    },
    tags: event.category?.slug ? [event.category.slug] : [],
    eventType: event.locationType === 'offline' ? 'in-person' : 'online',
    source: 'luma',
    sourceId: event.apiId,
    sourceUrl: event.url,
  };
}

/**
 * Normalize an RA (Resident Advisor) event to Renaissance schema
 */
export function normalizeRAEvent(event: RAEvent): RenaissanceEventInput {
  const startDateTime = combineDateTime(event.date, event.startTime);
  const endDateTime = combineDateTime(event.date, event.endTime);
  
  const artistNames = event.artists?.map(a => a.name) || [];

  return {
    name: event.title,
    location: event.venue?.name || 'Unknown Venue',
    startTime: startDateTime,
    endTime: endDateTime,
    flyerImage: event.flyerFront || undefined,
    metadata: {
      description: undefined,
      venue: {
        name: event.venue?.name || 'Unknown Venue',
      },
      artists: artistNames.length > 0 ? artistNames : undefined,
    },
    tags: ['music', 'nightlife'],
    eventType: 'in-person',
    source: 'ra',
    sourceId: event.id,
    sourceUrl: event.contentUrl?.startsWith('http') 
      ? event.contentUrl 
      : `https://ra.co${event.contentUrl}`,
  };
}

/**
 * Normalize a Meetup event to Renaissance schema
 */
export function normalizeMeetupEvent(event: MeetupEvent): RenaissanceEventInput {
  const location = event.venue 
    ? `${event.venue.name}, ${event.venue.city}, ${event.venue.state}`
    : 'Online';

  const endTime = event.endDateTime || addHours(event.dateTime, 2);

  return {
    name: event.title,
    location,
    startTime: event.dateTime,
    endTime,
    flyerImage: event.featuredEventPhoto?.highResUrl || undefined,
    metadata: {
      description: truncateDescription(event.description),
      host: {
        name: event.group?.name || 'Unknown Group',
        username: event.group?.urlname,
      },
      venue: event.venue ? {
        name: event.venue.name,
        address: event.venue.address,
        city: event.venue.city,
      } : undefined,
      rsvpCount: event.rsvps?.totalCount,
    },
    tags: ['meetup', 'community'],
    eventType: event.venue ? 'in-person' : 'online',
    source: 'meetup',
    sourceId: event.eventId,
    sourceUrl: event.eventUrl,
  };
}

/**
 * Generic normalize function that routes to the appropriate normalizer
 */
export function normalizeEvent(
  event: LumaEvent | RAEvent | MeetupEvent, 
  source: EventSource
): RenaissanceEventInput {
  switch (source) {
    case 'luma':
      return normalizeLumaEvent(event as LumaEvent);
    case 'ra':
      return normalizeRAEvent(event as RAEvent);
    case 'meetup':
      return normalizeMeetupEvent(event as MeetupEvent);
    default:
      throw new Error(`Unknown event source: ${source}`);
  }
}

function buildLocation(
  addressDescription?: string,
  fullAddress?: string | null,
  city?: string | null,
  region?: string | null
): string {
  if (fullAddress) return fullAddress;
  if (addressDescription) return addressDescription;
  
  const parts = [city, region].filter(Boolean);
  return parts.join(', ') || '';
}

function combineDateTime(date: string, time: string): string {
  if (!date) return new Date().toISOString();
  
  try {
    const dateOnly = date.split('T')[0];
    const timeOnly = time?.split('T')[1] || '00:00:00';
    return new Date(`${dateOnly}T${timeOnly}`).toISOString();
  } catch {
    return new Date(date).toISOString();
  }
}

function addHours(dateString: string, hours: number): string {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function truncateDescription(description: string | undefined, maxLength = 500): string | undefined {
  if (!description) return undefined;
  
  const stripped = description.replace(/<[^>]*>/g, '').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength - 3) + '...';
}

/**
 * Filter events to only include upcoming events
 */
export function filterUpcomingEvents<T extends { startTime?: string; startAt?: string; dateTime?: string; date?: string }>(
  events: T[]
): T[] {
  const now = new Date();
  return events.filter(event => {
    const startDate = event.startTime || event.startAt || event.dateTime || event.date;
    if (!startDate) return false;
    return new Date(startDate) >= now;
  });
}

/**
 * Deduplicate events by sourceId
 */
export function deduplicateEvents<T extends { sourceId?: string; apiId?: string; id?: string | number; eventId?: string }>(
  events: T[]
): T[] {
  const seen = new Set<string>();
  return events.filter(event => {
    const id = String(event.sourceId || event.apiId || event.eventId || event.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
