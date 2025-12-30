import { DAEvent, LumaEvent, RAEvent, MeetupEvent } from "../interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getGoingStatus = async (event: DAEvent): Promise<boolean> => {
  const result = await AsyncStorage.getItem(`Going-${event.id}`);
  return result ? true : false;
};

export const getGoingEvents = async (): Promise<number[]> => {
  const goingData = (await AsyncStorage.getItem(`GoingEvents`)) as string;
  return JSON.parse(goingData) ?? ([] as number[]);
};

export const toggleGoingStatus = async (event: DAEvent) => {
  const goingEvents = await getGoingEvents();
  const isGoing = await getGoingStatus(event);
  
  if (isGoing) {
    const result = goingEvents.filter((event_id: number) => {
      return event_id !== event.id;
    });
    await AsyncStorage.setItem("GoingEvents", JSON.stringify(result));
    await AsyncStorage.removeItem(`Going-${event.id}`);
  } else {
    goingEvents.push(event.id);
    await AsyncStorage.setItem("GoingEvents", JSON.stringify(goingEvents));
    await AsyncStorage.setItem(`Going-${event.id}`, "1");
  }
};

// Going status for web events (Luma/RA/DA/Meetup with URLs)
export const getGoingStatusForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup'
): Promise<boolean> => {
  if (eventType === 'da' && 'id' in event) {
    // Use existing DA event going system
    const result = await AsyncStorage.getItem(`Going-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'luma' && 'apiId' in event) {
    // Check Luma event going status
    const result = await AsyncStorage.getItem(`Going-luma-${event.apiId}`);
    return result ? true : false;
  } else if (eventType === 'ra' && 'id' in event) {
    // Check RA event going status
    const result = await AsyncStorage.getItem(`Going-ra-${event.id}`);
    return result ? true : false;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    // Check Meetup event going status
    const meetupEvent = event as MeetupEvent;
    const result = await AsyncStorage.getItem(`Going-meetup-${meetupEvent.eventId}`);
    return result ? true : false;
  }
  return false;
};

// Toggle going status for web events (Luma/RA/DA/Meetup with URLs)
export const toggleGoingStatusForWebEvent = async (
  event: LumaEvent | RAEvent | DAEvent | MeetupEvent,
  eventType: 'luma' | 'ra' | 'da' | 'meetup'
): Promise<boolean> => {
  const isGoing = await getGoingStatusForWebEvent(event, eventType);

  if (eventType === 'da' && 'id' in event && 'title' in event) {
    // Use existing DA event going system
    const daEvent = event as DAEvent;
    await toggleGoingStatus(daEvent);
    return !isGoing;
  } else if (eventType === 'luma' && 'apiId' in event) {
    // Handle Luma events - store full event data
    const lumaEvent = event as LumaEvent;
    const goingData = await AsyncStorage.getItem('GoingLumaEvents');
    let goingLumaEvents: LumaEvent[] = goingData ? JSON.parse(goingData) : [];

    if (isGoing) {
      // Remove going status
      goingLumaEvents = goingLumaEvents.filter((e: LumaEvent) => e.apiId !== lumaEvent.apiId);
      await AsyncStorage.removeItem(`Going-luma-${lumaEvent.apiId}`);
    } else {
      // Add going status
      goingLumaEvents.push(lumaEvent);
      await AsyncStorage.setItem(`Going-luma-${lumaEvent.apiId}`, "1");
    }
    await AsyncStorage.setItem('GoingLumaEvents', JSON.stringify(goingLumaEvents));
    return !isGoing;
  } else if (eventType === 'ra' && 'id' in event) {
    // Handle RA events - store full event data
    const raEvent = event as RAEvent;
    const goingData = await AsyncStorage.getItem('GoingRAEvents');
    let goingRAEvents: RAEvent[] = goingData ? JSON.parse(goingData) : [];

    if (isGoing) {
      // Remove going status
      goingRAEvents = goingRAEvents.filter((e: RAEvent) => e.id !== raEvent.id);
      await AsyncStorage.removeItem(`Going-ra-${raEvent.id}`);
    } else {
      // Add going status
      goingRAEvents.push(raEvent);
      await AsyncStorage.setItem(`Going-ra-${raEvent.id}`, "1");
    }
    await AsyncStorage.setItem('GoingRAEvents', JSON.stringify(goingRAEvents));
    return !isGoing;
  } else if (eventType === 'meetup' && 'eventId' in event) {
    // Handle Meetup events - store full event data
    const meetupEvent = event as MeetupEvent;
    const goingData = await AsyncStorage.getItem('GoingMeetupEvents');
    let goingMeetupEvents: MeetupEvent[] = goingData ? JSON.parse(goingData) : [];

    if (isGoing) {
      // Remove going status
      goingMeetupEvents = goingMeetupEvents.filter((e: MeetupEvent) => e.eventId !== meetupEvent.eventId);
      await AsyncStorage.removeItem(`Going-meetup-${meetupEvent.eventId}`);
    } else {
      // Add going status
      goingMeetupEvents.push(meetupEvent);
      await AsyncStorage.setItem(`Going-meetup-${meetupEvent.eventId}`, "1");
    }
    await AsyncStorage.setItem('GoingMeetupEvents', JSON.stringify(goingMeetupEvents));
    return !isGoing;
  }

  return false;
};

// Get all going events (DA by ID lookup, Luma/RA/Meetup from stored data)
export const getAllGoingEvents = async (): Promise<Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' }>> => {
  const goingEvents: Array<{ event: DAEvent | LumaEvent | RAEvent | MeetupEvent; eventType: 'da' | 'luma' | 'ra' | 'meetup' }> = [];

  // Get DA event IDs
  const daGoingIds = await getGoingEvents();
  
  // Fetch DA events from API
  try {
    const eventsRes = await fetch("https://api.detroiter.network/api/events");
    const fetchedEvents = await eventsRes.json();
    const daEvents: DAEvent[] = fetchedEvents.data || [];
    
    // Filter to only going DA events
    daEvents.forEach((event: DAEvent) => {
      if (daGoingIds.includes(event.id)) {
        goingEvents.push({ event, eventType: 'da' });
      }
    });
  } catch (error) {
    console.error("Error fetching DA events for going status:", error);
  }

  // Get Luma events
  try {
    const lumaGoingData = await AsyncStorage.getItem('GoingLumaEvents');
    if (lumaGoingData) {
      const lumaEvents: LumaEvent[] = JSON.parse(lumaGoingData);
      lumaEvents.forEach((event: LumaEvent) => {
        goingEvents.push({ event, eventType: 'luma' });
      });
    }
  } catch (error) {
    console.error("Error loading Luma going events:", error);
  }

  // Get RA events
  try {
    const raGoingData = await AsyncStorage.getItem('GoingRAEvents');
    if (raGoingData) {
      const raEvents: RAEvent[] = JSON.parse(raGoingData);
      raEvents.forEach((event: RAEvent) => {
        goingEvents.push({ event, eventType: 'ra' });
      });
    }
  } catch (error) {
    console.error("Error loading RA going events:", error);
  }

  // Get Meetup events
  try {
    const meetupGoingData = await AsyncStorage.getItem('GoingMeetupEvents');
    if (meetupGoingData) {
      const meetupEvents: MeetupEvent[] = JSON.parse(meetupGoingData);
      meetupEvents.forEach((event: MeetupEvent) => {
        goingEvents.push({ event, eventType: 'meetup' });
      });
    }
  } catch (error) {
    console.error("Error loading Meetup going events:", error);
  }

  return goingEvents;
};

