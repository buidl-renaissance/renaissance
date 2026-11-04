import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { Interest, INTEREST_LABELS, INTERESTS, TasteProfile, summarizeTaste } from "../utils/tasteProfile";

interface TasteFilterBarProps {
  profile: TasteProfile | null;
  forYou: boolean;
  chips: Interest[];
  onForYou: () => void;
  onAll: () => void;
  onToggleChip: (interest: Interest) => void;
  onEdit: () => void;
}

export const TasteFilterBar = ({
  profile,
  forYou,
  chips,
  onForYou,
  onAll,
  onToggleChip,
  onEdit,
}: TasteFilterBarProps) => {
  const summary = profile ? summarizeTaste(profile) : "Set up what you want more of";

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <TouchableOpacity
          style={[styles.forYou, forYou && styles.forYouOn]}
          onPress={onForYou}
          accessibilityRole="button"
          accessibilityState={{ selected: forYou }}
        >
          <Ionicons name="sparkles" size={14} color="#111" />
          <Text style={styles.forYouLabel}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, !forYou && chips.length === 0 && styles.chipOn]}
          onPress={onAll}
        >
          <Text style={[styles.chipLabel, !forYou && chips.length === 0 && styles.chipLabelOn]}>All</Text>
        </TouchableOpacity>
        {INTERESTS.map((interest) => {
          const on = forYou ? Boolean(profile?.interests.includes(interest)) : chips.includes(interest);
          const label = interest === "tech" ? "Tech" : interest === "food" ? "Food" : INTEREST_LABELS[interest];
          return (
            <TouchableOpacity key={interest} style={[styles.chip, on && styles.chipOn]} onPress={() => onToggleChip(interest)}>
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.summaryRow}>
        <Text style={styles.summary} numberOfLines={1}>{summary}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.edit} accessibilityRole="button">
          <Ionicons name="pencil" size={14} color={theme.textSecondary} />
          <Text style={styles.editLabel}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  forYou: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  forYouOn: {
    borderColor: theme.primaryLight,
  },
  forYouLabel: {
    color: "#111",
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
  chipLabelOn: {
    color: "#fff",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  summary: {
    flex: 1,
    color: theme.textSecondary,
    fontSize: 14,
  },
  edit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editLabel: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
