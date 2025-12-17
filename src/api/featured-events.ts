import { RAEvent } from "../interfaces";

const API_BASE_URL = "https://api.detroiter.network";

export interface FeaturedRAEventData {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  endTime: string;
  contentUrl: string;
  createdAt?: string;
}

/**
 * Fetch list of featured RA event IDs from backend
 */
export const getFeaturedRAEvents = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/featured-events/ra`);
    
    if (!response.ok) {
      console.warn("Featured events API not available, using empty list");
      return [];
    }
    
    const data = await response.json();
    return data.eventIds || [];
  } catch (error) {
    console.error("Error fetching featured RA events:", error);
    return [];
  }
};

/**
 * Add an RA event to featured list
 */
export const addFeaturedRAEvent = async (
  event: RAEvent
): Promise<boolean> => {
  try {
    const eventData: FeaturedRAEventData = {
      id: event.id,
      title: event.title,
      venue: event.venue.name,
      startTime: event.startTime,
      endTime: event.endTime,
      contentUrl: event.contentUrl,
    };

    const response = await fetch(`${API_BASE_URL}/api/featured-events/ra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.warn("Failed to add featured event to backend");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding featured RA event:", error);
    return false;
  }
};

/**
 * Remove an RA event from featured list
 */
export const removeFeaturedRAEvent = async (eventId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/featured-events/ra/${eventId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      console.warn("Failed to remove featured event from backend");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error removing featured RA event:", error);
    return false;
  }
};

