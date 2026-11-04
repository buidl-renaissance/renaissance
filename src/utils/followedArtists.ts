import AsyncStorage from "@react-native-async-storage/async-storage";
import { artistKey, FollowedArtist } from "./artists";

const STORAGE_KEY = "followed_artists_v1";

export async function loadFollowedArtists(): Promise<FollowedArtist[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.flatMap((item) => {
      if (!item || typeof item.name !== "string") return [];
      const key = artistKey(item.name);
      if (!key || seen.has(key)) return [];
      seen.add(key);
      return [{ key, name: item.name.trim() }];
    });
  } catch {
    return [];
  }
}

export async function saveFollowedArtists(artists: FollowedArtist[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(artists));
}
