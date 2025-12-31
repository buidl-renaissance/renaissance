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
  link: string;
  createdAt: string;
  updatedAt: string;
  homeTeam: SportsGameTeam;
  awayTeam: SportsGameTeam;
}

export interface SportsGamesResponse {
  games: SportsGame[];
  dateRange: {
    start: string;
    end: string;
  };
  total: number;
  counts: {
    nfl: number;
    nba: number;
    mlb: number;
    nhl: number;
  };
}

const API_BASE_URL = "https://sports.builddetroit.xyz";

/**
 * Fetch upcoming sports games
 */
export const getUpcomingSportsGames = async (): Promise<SportsGame[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/upcoming`);
    
    if (!response.ok) {
      console.warn("Sports games API not available");
      return [];
    }
    
    const data: SportsGamesResponse = await response.json();
    return data.games || [];
  } catch (error) {
    console.error("Error fetching sports games:", error);
    return [];
  }
};

