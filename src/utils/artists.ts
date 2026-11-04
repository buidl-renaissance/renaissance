export interface FollowedArtist {
  key: string;
  name: string;
}

const SUPPORT = /\s+(?:w\/|wsg|feat\.?|featuring|with special guests?|with)\s+/i;
const NOT_AN_ACT = /\b(night|party|presents|karaoke|workshop|audition|anniversary|thanksgiving|drive|showdown|tribute|dance|happy hour|open decks|record release|open enrollment)\b/i;

export function artistKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decode(value: string): string {
  return value
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "-")
    .replace(/&#8217;|&rsquo;|&#x2019;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const name = decode(value).replace(/^(canceled|cancelled|postponed|rescheduled):\s*/i, "").replace(/\[[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 60) return null;
  if (/^(tba|tbd|various|special guest|session)$/i.test(name)) return null;
  return name;
}

function looksLikeAct(value: string): boolean {
  if (value.length > 42) return false;
  if (NOT_AN_ACT.test(value)) return false;
  if (/[.!?]/.test(value)) return false;
  return true;
}

function splitBill(value: string): string[] {
  return value
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((part) => clean(part))
    .filter((part): part is string => Boolean(part) && looksLikeAct(part));
}

export function artistsFromTitle(title: string | null | undefined): string[] {
  const decoded = title ? decode(title).replace(/^(canceled|cancelled|postponed|rescheduled):\s*/i, "") : "";
  if (!decoded) return [];
  const parts = decoded.split(SUPPORT).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) {
    const head = clean(parts[0].split(/[:–—]/)[0]);
    const names = head && looksLikeAct(head) ? [head] : [];
    parts.slice(1).forEach((part) => names.push(...splitBill(part)));
    return names;
  }
  const only = clean(decoded);
  return only && looksLikeAct(only) ? [only] : [];
}

export function collectArtists(input: {
  title?: string | null;
  artists?: Array<string | { name?: string | null } | null> | null;
  source?: string | null;
}): FollowedArtist[] {
  const structured = (input.artists || [])
    .map((artist) => clean(typeof artist === "string" ? artist : artist?.name))
    .filter((name): name is string => Boolean(name));
  if (input.source === "sharpen-your-skills") {
    return dedupe(structured);
  }
  const names = structured.length
    ? structured
    : input.source === "comedy-castle" && input.title
      ? [clean(input.title)].filter((name): name is string => Boolean(name))
      : artistsFromTitle(input.title);
  return dedupe(names);
}

function dedupe(names: string[]): FollowedArtist[] {
  const seen = new Set<string>();
  const result: FollowedArtist[] = [];
  names.forEach((name) => {
    const key = artistKey(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push({ key, name });
  });
  return result;
}
