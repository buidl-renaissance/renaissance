import React from "react";

import { DAFlyer } from "../interfaces";

export interface EventsQuery {
  type?: string;
}

export const useFlyers = (query?: EventsQuery) => {
  const [flyers, setFlyers] = React.useState<DAFlyer[]>([]);

  React.useEffect(() => {
    updateFlyers();
    setTimeout(() => {
      updateFlyers();
    }, 10 * 60 * 1000);
  }, []);

  const updateFlyers = React.useCallback(() => {
    (async () => {
      const params = new URLSearchParams(query);
      console.log("UPDATE FLYERS!!");
      console.log("PARAMS: ", params.toString());
      const res = await fetch(
        `https://api.dpop.tech/api/flyers?${params.toString()}`
      );
      const result = await res.json();
      console.log('flyesr result: ', result)
      setFlyers(result.data);
    })();
  }, []);

  return [flyers];
};
