import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RestaurantCategory } from "../interfaces";
import { theme } from "../colors";

// Emoji mapping for restaurant categories
export const getCategoryEmoji = (category: RestaurantCategory | string): string => {
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

interface CategoryChipProps {
  category: RestaurantCategory | string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category }) => {
  const emoji = getCategoryEmoji(category);
  
  return (
    <View style={styles.categoryTag}>
      <Text style={styles.categoryText}>
        {emoji ? `${emoji} ` : ""}{category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryTag: {
    backgroundColor: theme.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryText: {
    fontSize: 11,
    color: theme.text,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
