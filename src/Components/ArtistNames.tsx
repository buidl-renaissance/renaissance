import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "../colors";
import { useFollowedArtists } from "../context/FollowedArtists";
import { FollowedArtist } from "../utils/artists";

export function ArtistNames({ artists }: { artists: FollowedArtist[] }) {
  if (!artists.length) return null;
  const shown = artists.slice(0, 3);
  const extra = artists.length - shown.length;
  return (
    <Text style={styles.label}>
      {shown.map((artist) => artist.name).join(", ")}
      {extra > 0 ? ` +${extra} more` : ""}
    </Text>
  );
}

export function FollowedArtistsBar({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const { artists, toggle } = useFollowedArtists();
  if (!artists.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bar}>
      <TouchableOpacity style={[styles.name, active && styles.nameOn]} onPress={onToggle}>
        <Text style={[styles.nameLabel, active && styles.nameLabelOn]}>Their events</Text>
      </TouchableOpacity>
      {artists.map((artist) => (
        <TouchableOpacity key={artist.key} style={styles.name} onPress={() => toggle(artist.name)}>
          <Text style={styles.nameLabel}>{artist.name} ×</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.text,
    fontSize: 11,
    marginTop: 2,
  },
  bar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  name: {
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nameOn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  nameLabel: {
    color: theme.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  nameLabelOn: {
    color: "#fff",
  },
});
