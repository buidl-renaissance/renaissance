import React from "react";

import { DAEvent } from "../interfaces";

export const useEvents = () => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);

  React.useEffect(() => {
    updateEvents();
    setTimeout(() => {
      updateEvents();
    }, 10 * 60 * 1000);
  }, []);

  const updateEvents = React.useCallback(() => {
    (async () => {
      console.log("UPDATE EVENTS!!");
      const eventsRes = await fetch("https://api.dpop.tech/api/events");
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  return [events];
};
