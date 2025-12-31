import React from "react";
import { SportsGame } from "../api/sports-games";
import { getUpcomingSportsGames } from "../api/sports-games";

export const useSportsGames = () => {
  const [games, setGames] = React.useState<SportsGame[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const hasFetchedRef = React.useRef(false);

  const updateGames = React.useCallback(async () => {
    try {
      setLoading(true);
      const gamesData = await getUpcomingSportsGames();
      setGames(gamesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching sports games:", err);
      setError(err as Error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    updateGames();
    
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      updateGames();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateGames]);

  return { games, loading, error, refresh: updateGames };
};

