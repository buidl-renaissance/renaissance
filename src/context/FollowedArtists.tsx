import React from "react";
import { FollowedArtist } from "../utils/artists";
import { loadFollowedArtists, saveFollowedArtists } from "../utils/followedArtists";
import { artistKey } from "../utils/artists";

interface FollowedArtistsContextValue {
  artists: FollowedArtist[];
  isFollowed: (name: string) => boolean;
  toggle: (name: string) => void;
}

const FollowedArtistsContext = React.createContext<FollowedArtistsContextValue>({
  artists: [],
  isFollowed: () => false,
  toggle: () => undefined,
});

export function FollowedArtistsProvider({ children }: { children: React.ReactNode }) {
  const [artists, setArtists] = React.useState<FollowedArtist[]>([]);

  React.useEffect(() => {
    loadFollowedArtists().then(setArtists);
  }, []);

  const toggle = React.useCallback((name: string) => {
    const key = artistKey(name);
    if (!key) return;
    setArtists((current) => {
      const next = current.some((artist) => artist.key === key)
        ? current.filter((artist) => artist.key !== key)
        : [...current, { key, name: name.trim() }];
      saveFollowedArtists(next);
      return next;
    });
  }, []);

  const isFollowed = React.useCallback((name: string) => {
    const key = artistKey(name);
    return artists.some((artist) => artist.key === key);
  }, [artists]);

  const value = React.useMemo(() => ({ artists, isFollowed, toggle }), [artists, isFollowed, toggle]);
  return (
    <FollowedArtistsContext.Provider value={value}>
      {children}
    </FollowedArtistsContext.Provider>
  );
}

export function useFollowedArtists() {
  return React.useContext(FollowedArtistsContext);
}
