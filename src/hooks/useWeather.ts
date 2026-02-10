import React from "react";

import { Weather } from "../interfaces";
import { useTenant } from "../context/TenantContext";

const DETROIT_GRID_URL =
  "https://api.weather.gov/gridpoints/DTX/66,34/forecast/hourly";

const DENVER_LAT = 39.7392;
const DENVER_LON = -104.9903;

async function fetchWeatherForDenver(): Promise<Weather> {
  const pointsRes = await fetch(
    `https://api.weather.gov/points/${DENVER_LAT},${DENVER_LON}`
  );
  if (!pointsRes.ok) {
    throw new Error(`Failed to fetch NWS points: ${pointsRes.status}`);
  }
  const pointsData = await pointsRes.json();
  const forecastHourlyUrl =
    pointsData?.properties?.forecastHourly;
  if (!forecastHourlyUrl) {
    throw new Error("No forecastHourly URL in NWS points response");
  }
  const forecastRes = await fetch(forecastHourlyUrl);
  if (!forecastRes.ok) {
    throw new Error(`Failed to fetch Denver forecast: ${forecastRes.status}`);
  }
  return forecastRes.json();
}

async function fetchWeatherForDetroit(): Promise<Weather> {
  const res = await fetch(DETROIT_GRID_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Detroit forecast: ${res.status}`);
  }
  return res.json();
}

export const useWeather = () => {
  const { tenantId } = useTenant();
  const [weather, setWeather] = React.useState<Weather>();

  const updateWeather = React.useCallback(() => {
    (async () => {
      try {
        const isDenverArea =
          tenantId === "denver" || tenantId === "eth-denver";
        const weatherData = isDenverArea
          ? await fetchWeatherForDenver()
          : await fetchWeatherForDetroit();
        setWeather(weatherData);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    })();
  }, [tenantId]);

  React.useEffect(() => {
    updateWeather();
    const interval = setInterval(updateWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateWeather]);

  return [weather];
};
