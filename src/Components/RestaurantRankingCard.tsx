import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RestaurantRanking } from "../interfaces";
import { MOCK_RESTAURANTS } from "../mocks/restaurants";
import { theme } from "../colors";
import { CategoryChip } from "./CategoryChip";

interface RestaurantRankingCardProps {
  ranking: RestaurantRanking;
  previousRank?: number;
}

export const RestaurantRankingCard: React.FC<RestaurantRankingCardProps> = ({
  ranking,
  previousRank,
}) => {
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === ranking.restaurantId);
  if (!restaurant) return null;

  const rankChange = previousRank ? previousRank - ranking.rank : 0;
  
  // Get other categories the restaurant is known for (excluding the current ranking category)
  const otherCategories = restaurant.categories.filter(
    (cat) => cat !== ranking.category
  );

  return (
    <View style={styles.card}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankBadgeText}>#{ranking.rank}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.neighborhood}>{restaurant.neighborhood}</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="trophy" size={14} color="#FFD700" />
          <Text style={styles.points}>{ranking.points} points</Text>
        </View>
        {otherCategories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {otherCategories.map((category, index) => (
              <CategoryChip key={index} category={category} />
            ))}
          </View>
        )}
      </View>
      {rankChange !== 0 && (
        <View style={styles.rankChange}>
          {rankChange > 0 ? (
            <Ionicons name="arrow-up" size={16} color={theme.success} />
          ) : (
            <Ionicons name="arrow-down" size={16} color={theme.error} />
          )}
          <Text
            style={[
              styles.rankChangeText,
              { color: rankChange > 0 ? theme.success : theme.error },
            ]}
          >
            {Math.abs(rankChange)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankBadgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textOnPrimary,
  },
  rankChange: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  rankChangeText: {
    fontSize: 10,
    marginLeft: 2,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  neighborhood: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  points: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
});

