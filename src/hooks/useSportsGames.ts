import React from "react";
import moment from "moment";
import { SportsGame } from "../api/sports-games";
import { getUpcomingSportsGames, getGameSummary } from "../api/sports-games";

/**
 * Check if a game is ongoing (started but not finished)
 */
const isGameOngoing = (game: SportsGame): boolean => {
  try {
    const now = moment();
    const startTime = moment(game.startTime);
    // Game has started
    if (startTime.isAfter(now)) {
      return false;
    }
    // Game is finished if gameState indicates it
    const finishedStates = ["post", "final", "closed"];
    if (game.gameState && typeof game.gameState === 'string' && finishedStates.includes(game.gameState.toLowerCase())) {
      return false;
    }
    // Assume game is ongoing if it has started and not finished
    // Also check if it's within a reasonable window (e.g., 4 hours for most sports)
    const fourHoursLater = startTime.clone().add(4, "hours");
    return fourHoursLater.isAfter(now);
  } catch (error) {
    console.error("Error in isGameOngoing:", error, game);
    return false;
  }
};

export const useSportsGames = () => {
  const [games, setGames] = React.useState<SportsGame[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const hasFetchedRef = React.useRef(false);
  const gamesRef = React.useRef<SportsGame[]>([]);

  // Keep ref in sync with state
  React.useEffect(() => {
    gamesRef.current = games;
  }, [games]);

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

  const updateOngoingGames = React.useCallback(async () => {
    const currentGames = gamesRef.current;
    const ongoingGames = currentGames.filter(isGameOngoing);
    
    // Update each ongoing game asynchronously
    ongoingGames.forEach(async (game) => {
      try {
        const updatedGame = await getGameSummary(game.sport, game.gameId);
        if (updatedGame) {
          setGames((prevGames) =>
            prevGames.map((g) => {
              if (g.id === game.id) {
                // Only update stats fields, preserve teams and other data
                const updated: Partial<SportsGame> = {};
                
                if (updatedGame.gameState !== undefined) {
                  updated.gameState = updatedGame.gameState;
                }
                if (updatedGame.homeScore !== undefined) {
                  updated.homeScore = updatedGame.homeScore;
                }
                if (updatedGame.awayScore !== undefined) {
                  updated.awayScore = updatedGame.awayScore;
                }
                if (updatedGame.period !== undefined) {
                  updated.period = updatedGame.period;
                }
                if (updatedGame.periodType !== undefined) {
                  updated.periodType = updatedGame.periodType;
                }
                if (updatedGame.statusDetail !== undefined) {
                  updated.statusDetail = updatedGame.statusDetail;
                }
                if (updatedGame.displayClock !== undefined) {
                  updated.displayClock = updatedGame.displayClock;
                }
                if (updatedGame.broadcasts !== undefined) {
                  updated.broadcasts = updatedGame.broadcasts;
                }
                if (updatedGame.updatedAt !== undefined) {
                  updated.updatedAt = updatedGame.updatedAt;
                }
                
                return { ...g, ...updated };
              }
              return g;
            })
          );
        }
      } catch (err) {
        console.error(`Error updating game ${game.gameId}:`, err);
      }
    });
  }, []);

  React.useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    updateGames();
    
    // Refresh game list every 30 minutes
    const interval = setInterval(() => {
      updateGames();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateGames]);

  React.useEffect(() => {
    // Only start polling for ongoing games after initial load
    if (games.length === 0) {
      return;
    }

    // Update ongoing games immediately
    updateOngoingGames();

    // Then poll every 30 seconds for ongoing games
    const interval = setInterval(() => {
      updateOngoingGames();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [games.length, updateOngoingGames]);

  return { games, loading, error, refresh: updateGames };
};

