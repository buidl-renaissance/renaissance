import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { Interest, INTEREST_LABELS, INTERESTS } from "../utils/tasteProfile";

interface TasteFilterBarProps {
  forYou: boolean;
  selected: Interest | null;
  onForYou: () => void;
  onEditFilters: () => void;
  onAll: () => void;
  onSelect: (interest: Interest) => void;
}

export const TasteFilterBar = ({
  forYou,
  selected,
  onForYou,
  onEditFilters,
  onAll,
  onSelect,
}: TasteFilterBarProps) => {
  const allOn = !forYou && selected === null;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <View style={[styles.forYou, forYou && styles.forYouOn]}>
          <TouchableOpacity
            style={styles.forYouMain}
            onPress={onForYou}
            accessibilityRole="button"
            accessibilityState={{ selected: forYou }}
          >
            <Text style={[styles.forYouLabel, forYou && styles.labelOn]}>For you</Text>
          </TouchableOpacity>
          <View style={[styles.divider, forYou && styles.dividerOn]} />
          <TouchableOpacity
            style={styles.forYouFilter}
            onPress={onEditFilters}
            accessibilityRole="button"
            accessibilityLabel="Edit For you filters"
          >
            <Ionicons name="filter" size={15} color={forYou ? "#fff" : theme.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.chip, allOn && styles.chipOn]}
          onPress={onAll}
        >
          <Text style={[styles.chipLabel, allOn && styles.labelOn]}>All</Text>
        </TouchableOpacity>
        {INTERESTS.map((interest) => {
          const on = !forYou && selected === interest;
          const label = interest === "tech" ? "Tech" : interest === "food" ? "Food" : INTEREST_LABELS[interest];
          return (
            <TouchableOpacity key={interest} style={[styles.chip, on && styles.chipOn]} onPress={() => onSelect(interest)}>
              <Text style={[styles.chipLabel, on && styles.labelOn]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  forYou: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  forYouOn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  forYouMain: {
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
  },
  forYouFilter: {
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: theme.borderLight,
  },
  dividerOn: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  forYouLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "700",
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  chipOn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  labelOn: {
    color: "#fff",
  },
});
