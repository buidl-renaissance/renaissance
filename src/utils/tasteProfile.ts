import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export const TASTE_PROFILE_KEY = "taste_profile_v1";
export const PROFILE_TURN_URL = "https://events.builddetroit.xyz/api/profile/turn";

export const INTERESTS = ["comedy", "art", "music", "sports", "tech"] as const;
export const AREAS = ["detroit", "ferndale", "royal-oak", "hamtramck", "anywhere"] as const;
export const WHEN_PREFS = ["weeknights", "weekends", "either"] as const;
export const PRICE_PREFS = ["free", "paid", "either"] as const;
export const TOPICS = ["interests", "areas", "when", "price"] as const;

export type Interest = (typeof INTERESTS)[number];
export type Area = (typeof AREAS)[number];
export type WhenPref = (typeof WHEN_PREFS)[number];
export type PricePref = (typeof PRICE_PREFS)[number];
export type Topic = (typeof TOPICS)[number];

export interface TasteOption {
  id: string;
  label: string;
}

export interface TasteProfile {
  interests: Interest[];
  areas: Area[];
  when: WhenPref | null;
  price: PricePref | null;
  notes: string[];
  answered: Topic[];
  completed: boolean;
}

export interface TasteTurn {
  message: string;
  options: TasteOption[];
  profile: TasteProfile;
  profilePatch: Partial<TasteProfile>;
  done: boolean;
}

export interface TasteEvent {
  interests: Interest[];
  city?: string | null;
  start?: string | null;
  price?: string | null;
  isFree?: boolean | null;
}

const OPTION_LABELS: Record<string, string> = {
  "interest:comedy": "Comedy",
  "interest:art": "Art",
  "interest:music": "Music",
  "interest:sports": "Sports",
  "interest:tech": "Tech and community",
  "area:detroit": "Detroit",
  "area:ferndale": "Ferndale",
  "area:royal-oak": "Royal Oak",
  "area:hamtramck": "Hamtramck",
  "area:anywhere": "Anywhere nearby",
  "when:weeknights": "Weeknights",
  "when:weekends": "Weekends",
  "when:either": "Either",
  "price:free": "Free",
  "price:paid": "Paid is fine",
  "price:either": "No preference",
};

const QUESTIONS: Record<Topic, string> = {
  interests: "What do you want more of on your calendar?",
  areas: "Where will you actually go?",
  when: "When do you usually go out?",
  price: "Do you want to stick to free events?",
};

export function emptyTasteProfile(): TasteProfile {
  return {
    interests: [],
    areas: [],
    when: null,
    price: null,
    notes: [],
    answered: [],
    completed: false,
  };
}

export function showEverythingProfile(): TasteProfile {
  return {
    interests: [],
    areas: ["anywhere"],
    when: "either",
    price: "either",
    notes: [],
    answered: ["interests", "areas", "when", "price"],
    completed: true,
  };
}

function isInterest(value: string): value is Interest {
  return (INTERESTS as readonly string[]).includes(value);
}

function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value);
}

function isWhen(value: string): value is WhenPref {
  return (WHEN_PREFS as readonly string[]).includes(value);
}

function isPrice(value: string): value is PricePref {
  return (PRICE_PREFS as readonly string[]).includes(value);
}

function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}

export function sanitizeTasteProfile(value: unknown): TasteProfile {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const interests = Array.isArray(raw.interests)
    ? [...new Set(raw.interests.filter((item): item is Interest => typeof item === "string" && isInterest(item)))]
    : [];
  const areas = Array.isArray(raw.areas)
    ? [...new Set(raw.areas.filter((item): item is Area => typeof item === "string" && isArea(item)))]
    : [];
  const notes = Array.isArray(raw.notes)
    ? raw.notes.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim().slice(0, 280)).slice(-8)
    : [];
  const answered = Array.isArray(raw.answered)
    ? [...new Set(raw.answered.filter((item): item is Topic => typeof item === "string" && isTopic(item)))]
    : [];
  return {
    interests,
    areas,
    when: typeof raw.when === "string" && isWhen(raw.when) ? raw.when : null,
    price: typeof raw.price === "string" && isPrice(raw.price) ? raw.price : null,
    notes,
    answered,
    completed: raw.completed === true,
  };
}

export function optionsFor(topic: Topic): TasteOption[] {
  const prefix = topic === "interests" ? "interest:" : topic === "areas" ? "area:" : topic === "when" ? "when:" : "price:";
  return Object.entries(OPTION_LABELS)
    .filter(([id]) => id.startsWith(prefix))
    .map(([id, label]) => ({ id, label }));
}

export function nextTopic(profile: TasteProfile): Topic | null {
  return TOPICS.find((topic) => !profile.answered.includes(topic)) ?? null;
}

export function applyTasteSelection(
  profile: TasteProfile,
  optionIds: string[],
  note?: string,
): { profile: TasteProfile; patch: Partial<TasteProfile> } {
  const next = sanitizeTasteProfile(profile);
  const patch: Partial<TasteProfile> = {};
  const interestPicks = optionIds
    .filter((id) => id.startsWith("interest:"))
    .map((id) => id.slice("interest:".length))
    .filter(isInterest);
  const areaPicks = optionIds
    .filter((id) => id.startsWith("area:"))
    .map((id) => id.slice("area:".length))
    .filter(isArea);
  const whenPick = optionIds
    .filter((id) => id.startsWith("when:"))
    .map((id) => id.slice("when:".length))
    .filter(isWhen)
    .pop();
  const pricePick = optionIds
    .filter((id) => id.startsWith("price:"))
    .map((id) => id.slice("price:".length))
    .filter(isPrice)
    .pop();

  if (interestPicks.length) {
    next.interests = [...new Set(interestPicks)];
    next.answered = [...new Set([...next.answered, "interests" as Topic])];
    patch.interests = next.interests;
  }
  if (areaPicks.length) {
    next.areas = areaPicks.includes("anywhere") ? ["anywhere"] : [...new Set(areaPicks)];
    next.answered = [...new Set([...next.answered, "areas" as Topic])];
    patch.areas = next.areas;
  }
  if (whenPick) {
    next.when = whenPick;
    next.answered = [...new Set([...next.answered, "when" as Topic])];
    patch.when = whenPick;
  }
  if (pricePick) {
    next.price = pricePick;
    next.answered = [...new Set([...next.answered, "price" as Topic])];
    patch.price = pricePick;
  }
  const trimmed = note?.trim();
  if (trimmed) {
    next.notes = [...next.notes, trimmed.slice(0, 280)].slice(-8);
    patch.notes = next.notes;
  }
  patch.answered = next.answered;
  return { profile: next, patch };
}

export function finishTasteProfile(profile: TasteProfile): TasteProfile {
  return {
    ...profile,
    areas: profile.areas.length ? profile.areas : ["anywhere"],
    when: profile.when ?? "either",
    price: profile.price ?? "either",
    answered: [...TOPICS],
    completed: true,
  };
}

export function scriptedTurn(profile: TasteProfile): TasteTurn {
  const topic = nextTopic(profile);
  if (!topic) {
    const finished = finishTasteProfile(profile);
    return {
      message: summarizeTaste(finished),
      options: [],
      profile: finished,
      profilePatch: finished,
      done: true,
    };
  }
  return {
    message: QUESTIONS[topic],
    options: optionsFor(topic),
    profile,
    profilePatch: {},
    done: false,
  };
}

export function sanitizeTasteTurn(value: unknown, fallback: TasteProfile): TasteTurn {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const options = Array.isArray(raw.options)
    ? raw.options
        .map((option) => {
          if (!option || typeof option !== "object") return null;
          const id = (option as { id?: unknown }).id;
          if (typeof id !== "string" || !OPTION_LABELS[id]) return null;
          return { id, label: OPTION_LABELS[id] };
        })
        .filter((option): option is TasteOption => Boolean(option))
    : [];
  const profile = sanitizeTasteProfile(raw.profile ?? fallback);
  const message = typeof raw.message === "string" && raw.message.trim() ? raw.message.trim().slice(0, 500) : "";
  const done = raw.done === true;
  if (!message) return scriptedTurn(fallback);
  return {
    message,
    options: done ? [] : options,
    profile: done ? finishTasteProfile(profile) : profile,
    profilePatch: {},
    done,
  };
}

export function summarizeTaste(profile: TasteProfile): string {
  const interests = profile.interests.length
    ? profile.interests.map((interest) => OPTION_LABELS[`interest:${interest}`]).join(", ")
    : "a bit of everything";
  const areas = !profile.areas.length || profile.areas.includes("anywhere")
    ? "around Detroit"
    : profile.areas.map((area) => OPTION_LABELS[`area:${area}`]).join(", ");
  const when = profile.when && profile.when !== "either" ? OPTION_LABELS[`when:${profile.when}`].toLowerCase() : "whenever you're free";
  const price = profile.price === "free" ? "I'll keep it to free events." : "Paid events are fine.";
  return `I'll lean toward ${interests}, ${areas}, ${when}. ${price}`;
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
  if (/\bart\b|\bgallery\b|\bexhibition\b/i.test(value)) found.add("art");
  if (/\bmusic\b|\bconcert\b|\bdj\b/i.test(value)) found.add("music");
  if (/\bsports?\b/i.test(value)) found.add("sports");
  if (/\btech\b|\bhackathon\b|\bmeetup\b/i.test(value)) found.add("tech");
  return [...found];
}

function cityMatches(city: string | null | undefined, areas: Area[]): boolean {
  if (!areas.length || areas.includes("anywhere")) return true;
  if (!city) return true;
  const value = city.toLowerCase();
  return areas.some((area) => {
    if (area === "royal-oak") return value.includes("royal oak");
    return value.includes(area);
  });
}

function whenMatches(start: string | null | undefined, when: WhenPref | null): boolean {
  if (!when || when === "either" || !start) return true;
  const day = moment(start).day();
  const weekend = day === 0 || day === 5 || day === 6;
  return when === "weekends" ? weekend : !weekend;
}

function isPaid(price?: string | null, isFree?: boolean | null): boolean | null {
  if (isFree === true) return false;
  if (isFree === false) return true;
  if (!price) return null;
  const text = price.toLowerCase();
  if (text.includes("free") || /^\$?\s*0(\.0+)?$/.test(text.trim())) return false;
  if (/\$\s*[1-9]/.test(text)) return true;
  return null;
}

export function matchesTaste(profile: TasteProfile | null, event: TasteEvent): boolean {
  if (!profile?.completed) return true;
  if (profile.interests.length) {
    if (!event.interests.length) return false;
    if (!event.interests.some((interest) => profile.interests.includes(interest))) return false;
  }
  if (!cityMatches(event.city, profile.areas)) return false;
  if (!whenMatches(event.start, profile.when)) return false;
  if (profile.price === "free" && isPaid(event.price, event.isFree) === true) return false;
  return true;
}
