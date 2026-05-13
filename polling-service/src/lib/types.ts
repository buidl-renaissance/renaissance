/**
 * Types for the Renaissance Event Polling Service
 * These mirror the mobile app's interfaces where applicable
 */

export type EventSource = 'luma' | 'ra' | 'meetup' | 'instagram' | 'renaissance';

export interface RenaissanceEventInput {
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  flyerImage?: string;
  metadata?: RenaissanceEventMetadata;
  tags?: string[];
  eventType: string;
  source: EventSource;
  sourceId: string;
  sourceUrl?: string;
}

export interface RenaissanceEventMetadata {
  description?: string;
  host?: {
    name: string;
    username?: string;
  };
  venue?: {
    name: string;
    address?: string;
    city?: string;
  };
  artists?: string[];
  ticketPrice?: string;
  ticketUrl?: string;
  rsvpCount?: number;
}

export interface RenaissanceEvent extends RenaissanceEventInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface LumaEvent {
  apiId: string;
  name: string;
  coverUrl: string;
  startAt: string;
  endAt: string;
  timezone: string;
  locationType: string;
  url: string;
  city: string | null;
  region: string | null;
  fullAddress: string | null;
  addressDescription: string;
  latitude: number | null;
  longitude: number | null;
  ticketPrice: any;
  isFree: boolean;
  hosts: Array<{
    name: string;
    username: string | null;
  }>;
  category?: {
    name: string;
    slug: string;
  };
}

export interface RAEvent {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  contentUrl: string;
  flyerFront: string | null;
  venue: {
    name: string;
    contentUrl: string;
  };
  artists: Array<{
    name: string;
  }>;
}

export interface MeetupEvent {
  id: number;
  eventId: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime?: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
  } | null;
  group: {
    name: string;
    urlname: string;
  };
  eventUrl: string;
  featuredEventPhoto?: {
    highResUrl: string;
  };
  rsvps?: {
    totalCount?: number;
  };
}

export interface PollResult {
  source: EventSource;
  success: boolean;
  eventsProcessed: number;
  eventsUpserted: number;
  errors: string[];
  duration: number;
  timestamp: string;
}

export interface PollerConfig {
  source: EventSource;
  enabled: boolean;
  apiUrl: string;
  cities?: string[];
}
