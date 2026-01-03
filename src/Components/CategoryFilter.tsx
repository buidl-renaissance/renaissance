import React from "react";
import { ScrollView, View } from "react-native";
import FilterBubble from "./FilterBubble";
import { RestaurantCategory } from "../interfaces";
import { theme } from "../colors";

interface CategoryFilterProps {
  selectedCategory: RestaurantCategory | "all";
  onCategoryChange: (category: RestaurantCategory | "all") => void;
}

const CATEGORIES: { label: string; value: RestaurantCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pizza", value: "pizza" },
  { label: "Burgers", value: "burgers" },
  { label: "Tacos", value: "tacos" },
  { label: "Drinks", value: "drinks" },
  { label: "Sushi", value: "sushi" },
  { label: "Italian", value: "italian" },
  { label: "Asian", value: "asian" },
  { label: "Mexican", value: "mexican" },
  { label: "American", value: "american" },
  { label: "Dessert", value: "dessert" },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <ScrollView
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {CATEGORIES.map((category) => (
        <FilterBubble
          key={category.value}
          flat={true}
          active={selectedCategory === category.value}
          name={category.label}
          onPress={() => onCategoryChange(category.value)}
        />
      ))}
      <View style={{ width: 16, height: 16 }} />
    </ScrollView>
  );
};

