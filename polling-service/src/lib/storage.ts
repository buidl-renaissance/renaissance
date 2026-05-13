/**
 * Renaissance Events Data Store Client
 * Handles upserting events to the Renaissance backend
 */

import { RenaissanceEventInput, RenaissanceEvent } from './types';
import { logger } from './logger';

const EVENTS_API_URL = process.env.EVENTS_API_URL || 'https://events.builddetroit.xyz';
const API_KEY = process.env.EVENTS_API_KEY || '';

interface UpsertResult {
  success: boolean;
  event?: RenaissanceEvent;
  error?: string;
  isNew?: boolean;
}

interface BulkUpsertResult {
  success: boolean;
  upserted: number;
  errors: string[];
  events: RenaissanceEvent[];
}

/**
 * Upsert a single event to the Renaissance data store
 * Uses sourceId + source as the unique key
 */
export async function upsertEvent(event: RenaissanceEventInput): Promise<UpsertResult> {
  try {
    const response = await fetch(`${EVENTS_API_URL}/api/events/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      event: result.event || result.data,
      isNew: result.isNew,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Bulk upsert events to the Renaissance data store
 */
export async function bulkUpsertEvents(events: RenaissanceEventInput[]): Promise<BulkUpsertResult> {
  const result: BulkUpsertResult = {
    success: true,
    upserted: 0,
    errors: [],
    events: [],
  };

  if (events.length === 0) {
    return result;
  }

  try {
    const response = await fetch(`${EVENTS_API_URL}/api/events/bulk-upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: JSON.stringify({ events }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        upserted: data.upserted || events.length,
        errors: data.errors || [],
        events: data.events || [],
      };
    }

    logger.warn(`Bulk upsert not available, falling back to individual upserts`, 'storage');
  } catch {
    logger.warn(`Bulk upsert failed, falling back to individual upserts`, 'storage');
  }

  for (const event of events) {
    const upsertResult = await upsertEvent(event);
    if (upsertResult.success) {
      result.upserted++;
      if (upsertResult.event) {
        result.events.push(upsertResult.event);
      }
      logger.upsertSuccess(event.source, event.sourceId);
    } else {
      result.errors.push(`${event.sourceId}: ${upsertResult.error}`);
      logger.upsertError(event.source, event.sourceId, upsertResult.error);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Check if an event exists by source and sourceId
 */
export async function eventExists(source: string, sourceId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${EVENTS_API_URL}/api/events/exists?source=${encodeURIComponent(source)}&sourceId=${encodeURIComponent(sourceId)}`,
      {
        method: 'GET',
        headers: {
          ...(API_KEY && { 'X-API-Key': API_KEY }),
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.exists === true;
  } catch {
    return false;
  }
}
