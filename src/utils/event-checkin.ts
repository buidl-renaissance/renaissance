import { EventCheckIn } from '../interfaces/rewards';
import { addCheckIn, hasCheckedIn as hasCheckedInStorage } from './rewards-storage';
import { DAEvent, LumaEvent, RAEvent } from '../interfaces';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface EventLocation {
  latitude: number;
  longitude: number;
  radius?: number; // in meters, default 100m
}

/**
 * Verify QR code matches event
 */
export function verifyQRCode(qrData: string, eventId: string, eventType: 'da' | 'luma' | 'ra'): boolean {
  try {
    // QR code format: "renaissance:checkin:{eventType}:{eventId}"
    const expectedPrefix = `renaissance:checkin:${eventType}:`;
    if (!qrData.startsWith(expectedPrefix)) {
      return false;
    }
    const qrEventId = qrData.replace(expectedPrefix, '');
    return qrEventId === eventId;
  } catch (error) {
    console.error('[EventCheckIn] Error verifying QR code:', error);
    return false;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verify location is within event radius
 */
export function verifyLocation(
  userLocation: Location,
  eventLocation: EventLocation
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    eventLocation.latitude,
    eventLocation.longitude
  );
  const radius = eventLocation.radius || 100; // default 100 meters
  return distance <= radius;
}

/**
 * Get event location from event data
 */
export function getEventLocation(
  event: DAEvent | LumaEvent | RAEvent
): EventLocation | null {
  // Try to extract location from event
  if ('venue' in event && event.venue) {
    const venue = event.venue as any;
    if (venue.latitude && venue.longitude) {
      return {
        latitude: venue.latitude,
        longitude: venue.longitude,
        radius: 100, // 100 meter radius
      };
    }
  }
  
  // Check for location in event data
  if ('location' in event && event.location) {
    const location = event.location as any;
    if (location.latitude && location.longitude) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 100,
      };
    }
  }

  // Check for coordinates in event metadata
  if ('data' in event && event.data) {
    const data = event.data as any;
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        radius: 100,
      };
    }
  }

  return null;
}

/**
 * Check if user has already checked in to event
 */
export async function hasCheckedIn(eventId: string): Promise<boolean> {
  return hasCheckedInStorage(eventId);
}

/**
 * Check in to event with verification
 */
export async function checkInToEvent(
  eventId: string,
  eventType: 'da' | 'luma' | 'ra',
  event: DAEvent | LumaEvent | RAEvent,
  options?: {
    qrData?: string;
    location?: Location;
    skipLocationVerification?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already checked in
    const alreadyCheckedIn = await hasCheckedIn(eventId);
    if (alreadyCheckedIn) {
      return { success: false, error: 'Already checked in to this event' };
    }

    // Verify QR code if provided
    if (options?.qrData) {
      const qrValid = verifyQRCode(options.qrData, eventId, eventType);
      if (!qrValid) {
        return { success: false, error: 'Invalid QR code for this event' };
      }
    }

    // Verify location if provided and not skipped
    if (options?.location && !options.skipLocationVerification) {
      const eventLocation = getEventLocation(event);
      if (eventLocation) {
        const locationValid = verifyLocation(options.location, eventLocation);
        if (!locationValid) {
          return {
            success: false,
            error: 'You must be at the event location to check in',
          };
        }
      }
    }

    // Record check-in
    const checkIn: EventCheckIn = {
      eventId,
      timestamp: Date.now(),
      location: options?.location,
      qrData: options?.qrData,
    };
    await addCheckIn(checkIn);

    return { success: true };
  } catch (error) {
    console.error('[EventCheckIn] Error checking in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check in',
    };
  }
}

/**
 * Generate QR code data for event
 */
export function generateEventQRCode(eventId: string, eventType: 'da' | 'luma' | 'ra'): string {
  return `renaissance:checkin:${eventType}:${eventId}`;
}

