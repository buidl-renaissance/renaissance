export interface DAUser {
  cid: string;
  created_at: string;
  email: string;
  email_verified_at: string | null;
  id: number;
  name: string;
  phone: string | null;
  public_address: string | null;
  public_name: string | null;
  organization: string | null;
  updated_at: string;
}

export interface DAContent {
  artwork?: DAArtwork;
  caption: string;
  data: any;
  id: number;
  timestamp?: string;
  user: DAUser;
}

export interface DAArtwork {
  slug: string;
  created_at: string;
  title: string;
  id: number;
  artist: any;
  data: any;
  meta: any;
  content: DAContent[];
  updated_at: string;
}
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
  id: number;
  title: string;
  description: string;
  budget: string;
}

export interface DAComment {
  user: DAUser;
  text: string;
}

export interface DAFlyer {
  id: string;
  data: any;
  event: DAEvent;
  user: DAUser;
}

export interface DAEventStats {
  num_going: number;
  num_interested: number;
}

export interface DAEvent {
  categories: string[];
  comments?: DAComment[];
  description?: string;
  end_date: string | null;
  excerpt: string;
  featured: boolean;
  id: any;
  image_data?: any;
  image: string | undefined;
  organizer: any;
  slug: string;
  start_date: string | null;
  stats?: DAEventStats;
  title: string;
  venue?: DAVenue;
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
  };
  dewpoint: {
    unitCode: string; //"wmoUnit:degC",
    value: number; //18.333333333333332
  };
  relativeHumidity: {
    unitCode: string; // "wmoUnit:percent",
    value: number; // 56
  };
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
  };
  periods: WeatherPeriod[];
}

export interface Weather {
  properties: WeatherProperties;
  type: string;
  geometry: object;
}
