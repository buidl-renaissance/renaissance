import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { CultureEvent } from "../interfaces";
import { theme } from "../colors";
import { ArtistNames } from "./ArtistNames";
import { collectArtists } from "../utils/artists";

const SOURCE_LABELS: Record<string, string> = {
  "comedy-castle": "Comedy Castle",
  "go-comedy": "Go Comedy",
  "planet-ant": "Planet Ant",
  mocad: "MOCAD",
  "detroit-artists-market": "Detroit Artists Market",
  wasserman: "Wasserman Projects",
  dia: "Detroit Institute of Arts",
  "detroit-i-love": "The Detroit I Love",
};

interface CultureEventCardProps {
  event: CultureEvent;
  onSelectEvent?: () => void;
}

export const CultureEventCard: React.FC<CultureEventCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const accent = event.category === "comedy"
    ? theme.eventComedy
    : event.category === "list"
      ? theme.primary
      : theme.eventArt;
  const tag = event.category === "comedy" ? "Comedy" : event.category === "list" ? "List" : "Art";
  const isNow = moment(event.startTime).isBefore()
    && moment(event.endTime || event.startTime).add(event.endTime ? 0 : 2, "hours").isAfter();

  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <TouchableOpacity style={[styles.row, { borderColor: accent }]} onPress={onSelectEvent}>
          <View style={styles.copy}>
            <View style={styles.timeRow}>
              <Text style={styles.time}>
                {moment(event.startTime).format("h:mm a")}
                {isNow ? "  NOW" : ""}
              </Text>
              <Text style={[styles.tag, { backgroundColor: accent }]}>
                {tag}
              </Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
            <Text style={styles.subtitle}>
              {event.venue}{event.city ? `, ${event.city}` : ""}
            </Text>
            <Text style={styles.subtitle}>
              {SOURCE_LABELS[event.source] || event.source}
              {event.price ? ` · ${event.price}` : ""}
            </Text>
            <ArtistNames artists={collectArtists({ title: event.name, source: event.source })} />
            {event.summary ? (
              <Text style={styles.summary} numberOfLines={2}>{event.summary}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
        {event.image ? (
          <TouchableOpacity style={styles.imageWrap} onPress={onSelectEvent}>
            <Image source={{ uri: event.image }} style={styles.image} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderLeftWidth: 3,
    paddingLeft: 6,
    marginLeft: -8,
    paddingRight: 8,
  },
  copy: {
    flex: 1,
    paddingRight: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  tag: {
    marginLeft: 6,
    overflow: "hidden",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: "#111827",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  summary: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  imageWrap: {
    padding: 8,
  },
  image: {
    height: 63,
    width: 63,
    borderRadius: 4,
  },
});
