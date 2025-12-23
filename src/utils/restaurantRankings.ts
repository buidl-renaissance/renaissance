import { Restaurant, RestaurantRanking, RestaurantCategory } from '../interfaces';
import { MOCK_RESTAURANTS, MOCK_RANKINGS } from '../mocks/restaurants';

export const getRankingsByCategory = (
  category: RestaurantCategory
): RestaurantRanking[] => {
  return MOCK_RANKINGS.filter((ranking) => ranking.category === category)
    .sort((a, b) => b.points - a.points)
    .map((ranking, index) => ({
      ...ranking,
      rank: index + 1,
    }));
};

export const getTopRestaurants = (
  category: RestaurantCategory,
  limit: number = 10
): Restaurant[] => {
  const rankings = getRankingsByCategory(category);
  const restaurantIds = rankings.slice(0, limit).map((r) => r.restaurantId);
  return MOCK_RESTAURANTS.filter((restaurant) =>
    restaurantIds.includes(restaurant.id)
  ).sort((a, b) => {
    const aRank = rankings.find((r) => r.restaurantId === a.id)?.rank || 999;
    const bRank = rankings.find((r) => r.restaurantId === b.id)?.rank || 999;
    return aRank - bRank;
  });
};

export const addPointsToRestaurant = (
  restaurantId: string,
  category: RestaurantCategory,
  points: number
): void => {
  // In a real implementation, this would update the backend
  // For now, this is a placeholder that would work with mock data
  console.log(`Adding ${points} points to restaurant ${restaurantId} in category ${category}`);
};

export const getRestaurantRanking = (
  restaurantId: string,
  category: RestaurantCategory
): RestaurantRanking | null => {
  const ranking = MOCK_RANKINGS.find(
    (r) => r.restaurantId === restaurantId && r.category === category
  );
  if (!ranking) return null;

  const categoryRankings = getRankingsByCategory(category);
  const rank = categoryRankings.findIndex((r) => r.restaurantId === restaurantId) + 1;
  return { ...ranking, rank };
};

export const getAllCategories = (): RestaurantCategory[] => {
  return ['pizza', 'burgers', 'tacos', 'drinks', 'sushi', 'italian', 'asian', 'mexican', 'american', 'dessert'];
};

