export interface DAVenue {
  id: number; // 583,
  author: string; // "2",
  status: string; // "publish",
  date: string; // "2022-09-18 16:45:53",
  date_utc: string; // "2022-09-18 16:45:53",
  modified: string; // "2022-09-18 16:45:53",
  modified_utc: string; // "2022-09-18 16:45:53",
  url: string; // "https://detroitartdao.com/venue/detroit-vineyards",
  venue: string; // "Detroit Vineyards",
  title: string; // "Detroit Vineyards",
  slug: string; // "detroit-vineyards",
  address: string; // "1000 Gratiot Ave",
  city: string; // "Detroit",
  country: string; // "United States",
  state: string; // "MI",
  zip: string; // "48207",
  stateprovince: string; // "MI",
  geo_lat: number; // 42.3406527,
  geo_lng: number; // -83.0401141,
  geo: {
      lat: number; // 42.3406527,
      lng: number; // -83.0401141,
  };
  show_map: boolean; // true,
  show_map_link: boolean; // true
  events?: DAEvent[];
}

export interface DAProposal {
  body: string;
  budget: string;
  category: string;
  description: string;
  id: number;
  title: string;
}

export interface DAEvent {
  image: string | undefined;
  image_data?: any;
  organizer: any;
  id: any;
  categories: string[];
  end_date: string | null;
  slug: string;
  start_date: string | null;
  title: string;
  featured: boolean;
  excerpt: string;
  venue: DAVenue;
}

export interface WeatherPeriod {
  number: number; // 1,
  name: string; // "",
  startTime: string; // "2023-07-29T16:00:00-04:00",
  endTime: string; // "2023-07-29T17:00:00-04:00",
  isDaytime: boolean; // true,
  temperature: number; // 82,
  temperatureUnit: string; // "F",
  temperatureTrend: string; // null,
  probabilityOfPrecipitation: {
    unitCode: string; // "wmoUnit:percent",
    value: number; // 3
  },
  dewpoint: {
    unitCode: string; //"wmoUnit:degC",
    value: number; //18.333333333333332
  },
  relativeHumidity: {
    unitCode: string; // "wmoUnit:percent",
    value: number; // 56
  },
  windSpeed: string; // "12 mph",
  windDirection: string; // "N",
  icon: string; // "https://api.weather.gov/icons/land/day/sct,3?size=small",
  shortForecast: string; // "Mostly Sunny",
  detailedForecast: string; // ""
}

export interface WeatherProperties {
  updated: string;
  units: string;
  forecastGenerator: string;
  generatedAt: string;
  updateTime: string;
  validTimes: string;
  elevation: {
    unitCode: string;
    value: number;
  }
  periods: WeatherPeriod[];
}

export interface Weather {
  properties: WeatherProperties;
  type: string;
  geometry: object;
}