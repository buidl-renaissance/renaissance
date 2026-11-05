import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export const TASTE_PROFILE_KEY = "taste_profile_v1";

export const INTERESTS = [
  "comedy",
  "art",
  "music",
  "sports",
  "tech",
  "food",
  "film",
  "outdoors",
  "family",
  "nightlife",
] as const;
export const WHEN_PREFS = ["daytime", "weeknights", "weekends"] as const;
export const DISTANCES = ["near", "downtown", "10-mi", "metro"] as const;
export const PRICE_PREFS = ["free", "under-25", "splurge"] as const;

export type Interest = (typeof INTERESTS)[number];
export type WhenPref = (typeof WHEN_PREFS)[number];
export type Distance = (typeof DISTANCES)[number];
export type PricePref = (typeof PRICE_PREFS)[number];

export interface TasteProfile {
  interests: Interest[];
  whens: WhenPref[];
  distance: Distance | null;
  prices: PricePref[];
  note: string;
  completed: boolean;
}

export interface TasteEvent {
  interests: Interest[];
  city?: string | null;
  start?: string | null;
  price?: string | null;
  isFree?: boolean | null;
}

export const INTEREST_LABELS: Record<Interest, string> = {
  comedy: "Comedy",
  art: "Art",
  music: "Music",
  sports: "Sports",
  tech: "Tech and community",
  food: "Food and drink",
  film: "Film",
  outdoors: "Outdoors",
  family: "Family",
  nightlife: "Nightlife",
};

export const WHEN_LABELS: Record<WhenPref, string> = {
  daytime: "Daytime",
  weeknights: "Weeknights",
  weekends: "Weekends",
};

export const WHEN_HINTS: Record<WhenPref, string> = {
  daytime: "Mon–Fri",
  weeknights: "After 5 pm",
  weekends: "Sat & Sun",
};

export const DISTANCE_LABELS: Record<Distance, string> = {
  near: "Near me",
  downtown: "Downtown",
  "10-mi": "10 mi",
  metro: "Metro",
};

export const PRICE_LABELS: Record<PricePref, string> = {
  free: "Free",
  "under-25": "Under $25",
  splurge: "Splurge-worthy",
};

const INNER_CITIES = ["detroit", "ferndale", "hamtramck", "royal oak"];

export function emptyTasteProfile(): TasteProfile {
  return {
    interests: [],
    whens: [],
    distance: null,
    prices: [],
    note: "",
    completed: false,
  };
}

function isInterest(value: string): value is Interest {
  return (INTERESTS as readonly string[]).includes(value);
}

function isWhen(value: string): value is WhenPref {
  return (WHEN_PREFS as readonly string[]).includes(value);
}

function isDistance(value: string): value is Distance {
  return (DISTANCES as readonly string[]).includes(value);
}

function isPrice(value: string): value is PricePref {
  return (PRICE_PREFS as readonly string[]).includes(value);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function migrateDistance(raw: Record<string, unknown>): Distance | null {
  if (typeof raw.distance === "string" && isDistance(raw.distance)) return raw.distance;
  const areas = Array.isArray(raw.areas) ? raw.areas.filter((item): item is string => typeof item === "string") : [];
  if (!areas.length || areas.includes("anywhere")) return null;
  if (areas.length === 1 && areas[0] === "detroit") return "downtown";
  return "10-mi";
}

function migrateWhens(raw: Record<string, unknown>): WhenPref[] {
  if (Array.isArray(raw.whens)) {
    return unique(raw.whens.filter((item): item is WhenPref => typeof item === "string" && isWhen(item)));
  }
  if (raw.when === "weeknights") return ["weeknights"];
  if (raw.when === "weekends") return ["weekends"];
  return [];
}

function migratePrices(raw: Record<string, unknown>): PricePref[] {
  if (Array.isArray(raw.prices)) {
    return unique(raw.prices.filter((item): item is PricePref => typeof item === "string" && isPrice(item)));
  }
  if (raw.price === "free") return ["free"];
  return [];
}

export function sanitizeTasteProfile(value: unknown): TasteProfile {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const interests = Array.isArray(raw.interests)
    ? unique(raw.interests.filter((item): item is Interest => typeof item === "string" && isInterest(item)))
    : [];
  const legacyNotes = Array.isArray(raw.notes)
    ? raw.notes.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
  const note = typeof raw.note === "string" ? raw.note.trim().slice(0, 280) : legacyNotes.join(". ").slice(0, 280);
  return {
    interests,
    whens: migrateWhens(raw),
    distance: migrateDistance(raw),
    prices: migratePrices(raw),
    note,
    completed: raw.completed === true,
  };
}

export function summarizeTaste(profile: TasteProfile): string {
  const parts: string[] = [];
  if (profile.interests.length) {
    parts.push(profile.interests.map((interest) => INTEREST_LABELS[interest].replace(" and community", "").replace(" and drink", "")).join(", "));
  }
  if (profile.whens.length) parts.push(profile.whens.map((when) => WHEN_LABELS[when]).join(", "));
  if (profile.distance) parts.push(DISTANCE_LABELS[profile.distance]);
  if (!parts.length && profile.prices.length) parts.push(profile.prices.map((price) => PRICE_LABELS[price]).join(", "));
  if (!parts.length && profile.note) return profile.note;
  return parts.join(" · ") || "A bit of everything";
}

export async function loadTasteProfile(): Promise<TasteProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(TASTE_PROFILE_KEY);
    if (!raw) return null;
    const profile = sanitizeTasteProfile(JSON.parse(raw));
    return profile.completed ? profile : null;
  } catch {
    return null;
  }
}

export async function saveTasteProfile(profile: TasteProfile): Promise<void> {
  await AsyncStorage.setItem(TASTE_PROFILE_KEY, JSON.stringify(profile));
}

export function interestsFromDaCategories(categories: string[] | undefined): Interest[] {
  const found = new Set<Interest>();
  const joined = (categories || []).join(" ");
  const compact = joined.toLowerCase().replace(/[^a-z]/g, "");
  if (/\bart\b/i.test(joined)) found.add("art");
  if (/\bmusic\b/i.test(joined) || compact.includes("thedetroiti")) found.add("music");
  if (/\bsport/i.test(joined)) found.add("sports");
  if (/\btech\b/i.test(joined) || /network/i.test(joined)) found.add("tech");
  if (/\bcomedy\b|\bimprov\b/i.test(joined)) found.add("comedy");
  return [...found];
}

export function interestsFromText(text: string | undefined | null): Interest[] {
  const value = text || "";
  const found = new Set<Interest>();
  if (/\bcomedy\b|\bimprov\b/i.test(value)) found.add("comedy");
  if (/\bart\b|\bgallery\b|\bexhibition\b|\bmuseum\b/i.test(value)) found.add("art");
  if (/\bmusic\b|\bconcert\b|\bdj\b|\bjazz\b|\btechno\b|\brave\b|\bkaraoke\b|\bopen mic\b/i.test(value)) found.add("music");
  if (/\bsports?\b/i.test(value)) found.add("sports");
  if (/\btech\b|\bhackathon\b|\bmeetup\b/i.test(value)) found.add("tech");
  if (/\bfood\b|\bdrink\b|\bdinner\b|\btasting\b|\bchef\b/i.test(value)) found.add("food");
  if (/\bfilm\b|\bmovie\b|\bcinema\b|\bscreening\b/i.test(value)) found.add("film");
  if (/\boutdoor\b|\bpark\b|\bhike\b/i.test(value)) found.add("outdoors");
  if (/\bfamily\b|\bkids\b|\bchildren\b|\ball-ages\b/i.test(value)) found.add("family");
  if (/\bnightlife\b|\bnight club\b|\bafter hours\b|\btechno\b|\brave\b|\bkaraoke\b/i.test(value)) found.add("nightlife");
  return [...found];
}

export function mergeInterests(base: Interest[], text?: string | null): Interest[] {
  return unique([...base, ...interestsFromText(text)]);
}

function cityValue(city: string | null | undefined): string {
  return (city || "").toLowerCase();
}

function distanceMatches(city: string | null | undefined, distance: Distance | null): boolean {
  if (!distance || distance === "metro") return true;
  const value = cityValue(city);
  if (!value) return true;
  if (distance === "downtown") return value.includes("detroit");
  return INNER_CITIES.some((name) => value.includes(name));
}

function whenBucket(start: string | null | undefined): WhenPref | null {
  if (!start) return null;
  const time = moment(start);
  if (!time.isValid()) return null;
  const day = time.day();
  if (day === 0 || day === 6) return "weekends";
  if (time.hour() >= 17) return "weeknights";
  return "daytime";
}

function dollarAmount(price?: string | null, isFree?: boolean | null): number | null {
  if (isFree === true) return 0;
  if (!price) return isFree === false ? null : null;
  const text = price.toLowerCase();
  if (text.includes("free")) return 0;
  const match = text.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}

function priceMatches(event: TasteEvent, prices: PricePref[]): boolean {
  if (!prices.length) return true;
  const amount = dollarAmount(event.price, event.isFree);
  if (amount == null) return true;
  return prices.some((price) => {
    if (price === "free") return amount === 0;
    if (price === "under-25") return amount <= 25;
    return amount > 25;
  });
}

export function matchesTaste(profile: TasteProfile | null, event: TasteEvent): boolean {
  if (!profile?.completed) return true;
  if (profile.interests.length) {
    if (!event.interests.length) return false;
    if (!event.interests.some((interest) => profile.interests.includes(interest))) return false;
  }
  if (!distanceMatches(event.city, profile.distance)) return false;
  if (profile.whens.length) {
    const bucket = whenBucket(event.start);
    if (bucket && !profile.whens.includes(bucket)) return false;
  }
  if (!priceMatches(event, profile.prices)) return false;
  return true;
}
