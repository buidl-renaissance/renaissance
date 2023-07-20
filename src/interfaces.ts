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

export interface DAEvent {
  venue: DAVenue;
}
