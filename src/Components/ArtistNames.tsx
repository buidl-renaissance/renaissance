import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../colors";
import { useFollowedArtists } from "../context/FollowedArtists";
import { FollowedArtist } from "../utils/artists";

export function ArtistNames({ artists }: { artists: FollowedArtist[] }) {
  const { isFollowed, toggle } = useFollowedArtists();
  if (!artists.length) return null;
  return (
    <View style={styles.names}>
      {artists.slice(0, 4).map((artist) => {
        const followed = isFollowed(artist.name);
        return (
          <TouchableOpacity
            key={artist.key}
            style={[styles.name, followed && styles.nameOn]}
            onPress={() => toggle(artist.name)}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
          >
            <Text style={[styles.nameLabel, followed && styles.nameLabelOn]}>
              {artist.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
  names: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
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
