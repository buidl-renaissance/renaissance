import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RestaurantRanking, RestaurantCategory } from "../interfaces";
import { MOCK_RESTAURANTS } from "../mocks/restaurants";

interface RestaurantRankingCardProps {
  ranking: RestaurantRanking;
  previousRank?: number;
}

// Emoji mapping for restaurant categories
const getCategoryEmoji = (category: RestaurantCategory | string): string => {
  const emojiMap: Record<string, string> = {
    restaurants: "🍽️",
    pizza: "🍕",
    burgers: "🍔",
    tacos: "🌮",
    drinks: "🥤",
    sushi: "🍣",
    italian: "🍝",
    asian: "🥢",
    mexican: "🌶️",
    american: "🍗",
    dessert: "🍰",
    seafood: "🦞",
    bbq: "🍖",
    vegetarian: "🥗",
    thai: "🍜",
    breakfast: "🥞",
    mediterranean: "🥙",
    indian: "🍛",
    chinese: "🥡",
  };
  return emojiMap[category] || "";
};

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
            {otherCategories.map((category, index) => {
              const emoji = getCategoryEmoji(category);
              return (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>
                    {emoji ? `${emoji} ` : ""}{category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: {
    backgroundColor: "#3449ff",
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
    color: "#fff",
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
    marginBottom: 8,
  },
  points: {
    fontSize: 12,
    color: "#3449ff",
    fontWeight: "600",
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
});

