import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RestaurantRanking, RestaurantCategory } from "../interfaces";
import { MOCK_RESTAURANTS } from "../mocks/restaurants";

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

  return (
    <View style={styles.card}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankNumber}>{ranking.rank}</Text>
        {rankChange !== 0 && (
          <View style={styles.rankChange}>
            {rankChange > 0 ? (
              <Ionicons name="arrow-up" size={16} color="#4CAF50" />
            ) : (
              <Ionicons name="arrow-down" size={16} color="#F44336" />
            )}
            <Text
              style={[
                styles.rankChangeText,
                { color: rankChange > 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              {Math.abs(rankChange)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.neighborhood}>{restaurant.neighborhood}</Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="trophy" size={14} color="#FFD700" />
          <Text style={styles.points}>{ranking.points} points</Text>
        </View>
      </View>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{ranking.category}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 50,
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3449ff",
  },
  rankChange: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
    color: "#333",
    marginBottom: 4,
  },
  neighborhood: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  points: {
    fontSize: 12,
    color: "#3449ff",
    fontWeight: "600",
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

