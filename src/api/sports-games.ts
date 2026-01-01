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

/**
 * Fetch game summary/status for a specific game
 * Returns only the stats fields that should be updated
 */
export const getGameSummary = async (sport: string, eventId: string): Promise<Partial<SportsGame> | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/summary?sport=${sport}&eventId=${eventId}&refresh=true`);
    
    if (!response.ok) {
      console.warn(`Game summary API not available for ${sport} game ${eventId}`);
      return null;
    }
    
    const data: any = await response.json();
    
    // The API returns a nested structure - check both possible locations
    const competition = data?.summary?.header?.competitions?.[0] || data?.header?.competitions?.[0];
    if (!competition) {
      return null;
    }

    const competitors = competition.competitors || [];
    const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
    const awayTeam = competitors.find((c: any) => c.homeAway === 'away');
    
    const status = competition.status;
    const period = status?.period ?? null;
    const displayPeriod = status?.displayPeriod || status?.type?.statusSecondary || '';
    const displayClock = status?.displayClock || '';
    
    // Parse period type based on sport and displayPeriod
    // For NHL: "2nd" -> "Period"
    // For NBA/NFL: "Q3" -> "Q"  
    // For MLB: "Top 3rd" -> "Inning"
    let periodType = '';
    if (displayPeriod) {
      const lowerPeriod = displayPeriod.toLowerCase();
      if (lowerPeriod.includes('period')) {
        periodType = 'Period';
      } else if (lowerPeriod.includes('q') || lowerPeriod.includes('quarter')) {
        periodType = 'Q';
      } else if (lowerPeriod.includes('inning')) {
        periodType = 'Inning';
      } else if (sport.toLowerCase() === 'nhl' && period !== null) {
        // NHL uses "2nd", "3rd" format
        periodType = 'Period';
      } else if ((sport.toLowerCase() === 'nba' || sport.toLowerCase() === 'nfl') && period !== null) {
        periodType = 'Q';
      } else if (sport.toLowerCase() === 'mlb' && period !== null) {
        periodType = 'Inning';
      }
    } else if (period !== null) {
      // Fallback based on sport
      if (sport.toLowerCase() === 'nhl') {
        periodType = 'Period';
      } else if (sport.toLowerCase() === 'nba' || sport.toLowerCase() === 'nfl') {
        periodType = 'Q';
      } else if (sport.toLowerCase() === 'mlb') {
        periodType = 'Inning';
      }
    }

    // Extract broadcasting information
    const broadcastsData = competition.broadcasts || data?.broadcasts || [];
    const broadcasts = broadcastsData.map((b: any) => ({
      type: b.type?.shortName || b.type?.name || '',
      name: b.media?.name || b.station || '',
      shortName: b.media?.shortName || b.station || '',
    })).filter((b: any) => b.shortName || b.name);

    const result: Partial<SportsGame> = {
      homeScore: homeTeam?.score ? parseInt(homeTeam.score, 10) : null,
      awayScore: awayTeam?.score ? parseInt(awayTeam.score, 10) : null,
      period: period,
      periodType: periodType,
      gameState: status?.type?.state || status?.type?.name?.replace('STATUS_', '').toLowerCase() || '',
      statusDetail: status?.type?.detail || status?.type?.description || '',
      displayClock: displayClock,
      broadcasts: broadcasts.length > 0 ? broadcasts : undefined,
    };

    return result;
  } catch (error) {
    console.error(`Error fetching game summary for ${sport} game ${eventId}:`, error);
    return null;
  }
};

