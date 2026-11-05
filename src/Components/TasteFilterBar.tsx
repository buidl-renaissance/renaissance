import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../colors";
import { Interest, INTEREST_LABELS, INTERESTS } from "../utils/tasteProfile";

interface TasteFilterBarProps {
  chips: Interest[];
  onAll: () => void;
  onToggleChip: (interest: Interest) => void;
}

export const TasteFilterBar = ({
  chips,
  onAll,
  onToggleChip,
}: TasteFilterBarProps) => {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <TouchableOpacity
          style={[styles.chip, chips.length === 0 && styles.chipOn]}
          onPress={onAll}
        >
          <Text style={[styles.chipLabel, chips.length === 0 && styles.chipLabelOn]}>All</Text>
        </TouchableOpacity>
        {INTERESTS.map((interest) => {
          const on = chips.includes(interest);
          const label = interest === "tech" ? "Tech" : interest === "food" ? "Food" : INTEREST_LABELS[interest];
          return (
            <TouchableOpacity key={interest} style={[styles.chip, on && styles.chipOn]} onPress={() => onToggleChip(interest)}>
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{label}</Text>
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
  chipLabelOn: {
    color: "#fff",
  },
});
