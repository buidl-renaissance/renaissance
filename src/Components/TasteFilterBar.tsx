import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../colors";
import { Interest, INTERESTS, TasteProfile } from "../utils/tasteProfile";

const LABELS: Record<Interest, string> = {
  comedy: "Comedy",
  art: "Art",
  music: "Music",
  sports: "Sports",
  tech: "Tech",
};

interface TasteFilterBarProps {
  profile: TasteProfile | null;
  onChange: (interests: Interest[]) => void;
  onTune: () => void;
}

export const TasteFilterBar = ({ profile, onChange, onTune }: TasteFilterBarProps) => {
  const selected = profile?.interests ?? [];
  const showingAll = selected.length === 0;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <TouchableOpacity
          style={[styles.chip, showingAll && styles.chipActive]}
          onPress={() => onChange([])}
        >
          <Text style={[styles.label, showingAll && styles.labelActive]}>All</Text>
        </TouchableOpacity>
        {INTERESTS.map((interest) => {
          const active = selected.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                if (active) onChange(selected.filter((item) => item !== interest));
                else onChange([...selected, interest]);
              }}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{LABELS[interest]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity onPress={onTune} style={styles.tune}>
        <Text style={styles.tuneLabel}>Tune this</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  row: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  label: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: "#fff",
  },
  tune: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tuneLabel: {
    color: theme.primaryLight,
    fontSize: 13,
    fontWeight: "600",
  },
});
