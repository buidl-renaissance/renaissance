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

export interface ContentUpload {
  id: string;
  uri: string;
  type: 'audio' | 'image';
  timestamp: number;
  elapsedTime?: number;
  metadata?: any;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  remoteUrl?: string;
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
  description: string;
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
  url?: string;
  venue?: DAVenue;
  content?: string;
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

export interface LumaHost {
  apiId: string;
  name: string;
  avatarUrl: string;
  bioShort: string | null;
  timezone: string;
  isVerified: boolean;
  instagramHandle: string | null;
  twitterHandle: string | null;
  linkedinHandle: string | null;
  tiktokHandle: string | null;
  youtubeHandle: string | null;
  website: string | null;
  username: string | null;
  createdAt: string | null;
  updatedAt: string;
}

export interface LumaCategory {
  apiId: string;
  name: string;
  description: string;
  slug: string;
  eventCount: number;
  subscriberCount: number;
  tintColor: string;
  iconUrl: string;
  heroImageDesktopUrl: string;
  simpleIconUrl: string;
  socialImageUrl: string;
  pageTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface LumaCalendar {
  apiId: string;
  name: string;
  description: string | null;
  timezone: string | null;
  tintColor: string;
  createdAt: string | null;
  updatedAt: string;
}

export interface LumaEvent {
  apiId: string;
  name: string;
  calendarApiId: string;
  categorySlug: string;
  coverUrl: string;
  startAt: string;
  endAt: string;
  timezone: string;
  locationType: string;
  eventType: string;
  visibility: string;
  url: string;
  userApiId: string;
  hideRsvp: boolean;
  showGuestList: boolean;
  waitlistEnabled: boolean;
  oneToOne: boolean;
  recurrenceId: string | null;
  guestCount: number;
  ticketCount: number;
  city: string | null;
  region: string | null;
  country: string | null;
  fullAddress: string | null;
  address: string | null;
  cityState: string;
  addressDescription: string;
  countryCode: string | null;
  placeId: string | null;
  appleMapsPlaceId: string | null;
  addressMode: string;
  addressType: string | null;
  geoAddressVisibility: string;
  latitude: number | null;
  longitude: number | null;
  virtualHasAccess: boolean;
  ticketPrice: any;
  ticketCurrency: string | null;
  ticketMaxPrice: number | null;
  isFree: boolean;
  isSoldOut: boolean;
  spotsRemaining: number | null;
  isNearCapacity: boolean;
  requireApproval: boolean;
  currencyCode: string | null;
  currencySymbol: string | null;
  coverVibrantColor: string | null;
  coverColors: string[];
  tintColor: string | null;
  locale: string | null;
  soldOut: boolean | null;
  metadata: any | null;
  createdAt: string | null;
  updatedAt: string;
  category: LumaCategory;
  calendar: LumaCalendar;
  hosts: LumaHost[];
  distance?: number;
}

export interface RAArtist {
  id: string;
  name: string;
}

export interface RAVenue {
  id: string;
  name: string;
  contentUrl: string;
}

export interface RAEventImage {
  id: string;
  filename: string;
  alt: string | null;
  type: string;
  crop: any | null;
  __typename: string;
}

export interface RATicket {
  validType: string;
  onSaleFrom: string;
  onSaleUntil: string;
  __typename: string;
}

export interface RAEvent {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  contentUrl: string;
  flyerFront: string | null;
  isTicketed: boolean | null;
  interestedCount: number | null;
  venue: RAVenue;
  artists: RAArtist[];
  images: RAEventImage[];
  tickets: RATicket[];
  pick: any | null;
  featured?: boolean;
  isFeatured?: boolean;
}

export interface MeetupGroup {
  id: string;
  name: string;
  urlname: string;
  timezone: string;
  keyGroupPhoto?: {
    baseUrl: string;
    highResUrl: string;
    id: string;
  };
}

export interface MeetupVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface MeetupEvent {
  id: number;
  eventId: string;
  title: string;
  description: string;
  dateTime: string;
  venue: MeetupVenue | null;
  group: MeetupGroup;
  eventUrl: string;
  eventData?: {
    featuredEventPhoto?: {
      baseUrl: string;
      highResUrl: string;
      id: string;
      __typename?: string;
    };
    rsvps?: {
      totalCount?: number;
      count?: number;
      yesRsvpCount?: number;
      goingCount?: number;
      edges?: any[];
      __typename?: string;
    };
    [key: string]: any;
  };
  featuredEventPhoto?: {
    baseUrl: string;
    highResUrl: string;
    id: string;
    __typename?: string;
  };
  rsvps?: {
    totalCount?: number;
    count?: number;
    yesRsvpCount?: number;
    goingCount?: number;
    edges?: any[];
  };
  RSVPs?: {
    totalCount?: number;
    count?: number;
    yesRsvpCount?: number;
    goingCount?: number;
    edges?: any[];
  };
}

export type RestaurantCategory = 'restaurants' | 'pizza' | 'burgers' | 'tacos' | 'drinks' | 'sushi' | 'italian' | 'asian' | 'mexican' | 'american' | 'dessert' | 'seafood' | 'bbq' | 'vegetarian' | 'breakfast' | 'mediterranean' | 'thai' | 'indian' | 'chinese';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  categories: RestaurantCategory[];
  image?: string;
  rating?: number;
  points?: number;
  description?: string;
  geo?: {
    lat: number;
    lng: number;
  };
}

export interface RestaurantRanking {
  restaurantId: string;
  category: RestaurantCategory;
  points: number;
  rank: number;
}

export interface BucketList {
  id: string;
  name: string;
  ownerId: string;
  collaborators: string[];
  restaurants: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodPost {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  image?: string;
  caption: string;
  comments: DAComment[];
  likes: number;
  timestamp: string;
}

export interface SportsGameTeam {
  id: number;
  teamId: string;
  sport: string;
  uid: string | null;
  displayName: string;
  abbreviation: string;
  shortDisplayName: string;
  color: string | null;
  alternateColor: string | null;
  logo: string;
  logoDark: string;
  isActive: boolean;
  isAllStar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportsGame {
  id: number;
  gameId: string;
  sport: string;
  season: number;
  seasonType: number;
  startTime: string;
  gameState: string;
  venue: string;
  venueCity: string;
  venueState: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  period: number | null;
  periodType: string;
  statusDetail: string;
  displayClock?: string;
  broadcasts?: Array<{
    type?: string;
    name?: string;
    shortName?: string;
  }>;
  link: string;
  createdAt: string;
  updatedAt: string;
  homeTeam: SportsGameTeam;
  awayTeam: SportsGameTeam;
}

export interface InstagramEvent {
  id: number;
  postCode: string;
  instagramUrl: string;
  imageUrl: string;
  name: string;
  description: string | null;
  type: string;
  startDatetime: string;
  endDatetime: string | null;
  artistNames: string[];
  venue: string;
  location: string;
  metadata: {
    price: string | null;
    ticketUrl: string | null;
    additionalInfo: string | null;
  };
  createdAt: string;
  updatedAt: string;
}
