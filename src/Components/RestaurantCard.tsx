import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Restaurant, RestaurantCategory } from "../interfaces";
import { theme } from "../colors";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  onAddToBucketList?: () => void;
  showRanking?: boolean;
  rank?: number;
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

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onAddToBucketList,
  showRanking = false,
  rank,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showRanking && rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant" size={40} color={theme.textSecondary} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.neighborhood}>{restaurant.neighborhood}</Text>
        <View style={styles.categoriesContainer}>
          {restaurant.categories.slice(0, 3).map((category, index) => {
            const emoji = getCategoryEmoji(category);
            return (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {emoji ? `${emoji} ` : ""}{category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.footer}>
          {restaurant.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{restaurant.rating}</Text>
            </View>
          )}
          {restaurant.points && (
            <Text style={styles.points}>{restaurant.points} pts</Text>
          )}
          {onAddToBucketList && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToBucketList();
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#3449ff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#3449ff",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  rankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  neighborhood: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 4,
    fontWeight: "600",
  },
  points: {
    fontSize: 12,
    color: "#3449ff",
    fontWeight: "600",
  },
  addButton: {
    padding: 4,
  },
});

