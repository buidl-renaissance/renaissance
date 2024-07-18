import React from "react";

import { DAEvent } from "../interfaces";

export interface EventsQuery {
  type?: string;
}

export const useEvents = (query?: EventsQuery) => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);

  React.useEffect(() => {
    updateEvents();
    setTimeout(() => {
      updateEvents();
    }, 10 * 60 * 1000);
  }, []);

  const updateEvents = React.useCallback(() => {
    (async () => {
      const params = new URLSearchParams(query);
      console.log("UPDATE EVENTS!!");
      console.log("PARAMS: ", params.toString());
      const eventsRes = await fetch(
        `https://api.detroiter.network/api/events?${params.toString()}`
      );
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  return [events];
};
