import React from "react";

import { DAVenue } from "../interfaces";

export const useVenues = () => {
  const [venues, setVenues] = React.useState<DAVenue[]>([]);

  React.useEffect(() => {
    if (!venues?.length) updateVenues();
  }, [venues]);

  const updateVenues = React.useCallback(() => {
    (async () => {
      console.log("UPDATE VENUES!!");
      const eventsRes = await fetch("https://api.detroiter.network/api/venues");
      const fetchedEvents = await eventsRes.json();
      setVenues(fetchedEvents.data);
    })();
  }, []);

  return [ venues ];
};
