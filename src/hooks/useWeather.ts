import React from "react";

import { Weather } from "../interfaces";

export const useWeather = () => {
  const [weather, setWeather] = React.useState<Weather>();

  const updateWeather = React.useCallback(() => {
    (async () => {
      console.log("UPDATE WEATHER!!");
      const weatherRes = await fetch(
        "https://api.weather.gov/gridpoints/DTX/66,34/forecast/hourly"
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData);
    })();
  }, []);

  React.useEffect(() => {
    updateWeather();
    setTimeout(() => {
      updateWeather();
    }, 10 * 60 * 1000);
  }, []);

  return [ weather ];
};
