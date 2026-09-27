import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { ConcertEvent } from "../interfaces";
import { theme } from "../colors";

const SOURCE_LABELS: Record<ConcertEvent["source"], string> = {
  ticketmaster: "Ticketmaster",
  seatgeek: "SeatGeek",
  "el-club": "El Club",
  "lager-house": "The Lager House",
  "cliff-bells": "Cliff Bell's",
  "marble-bar": "The Marble Bar",
  "sharpen-your-skills": "Sharpen Your Skills",
};

interface ConcertEventCardProps {
  event: ConcertEvent;
  onSelectEvent?: () => void;
}

export const ConcertEventCard: React.FC<ConcertEventCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const isNow = moment(event.startTime).isBefore() && moment(event.endTime || event.startTime).add(event.endTime ? 0 : 3, "hours").isAfter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} onPress={onSelectEvent}>
        <View style={styles.copy}>
          <Text style={styles.time}>
            {moment(event.startTime).format("h:mm a")}
            {isNow ? "  NOW" : ""}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {event.name}
          </Text>
          <Text style={styles.subtitle}>
            {event.venue}{event.city ? `, ${event.city}` : ""}
          </Text>
          <Text style={styles.subtitle}>
            {SOURCE_LABELS[event.source]}{event.price ? ` · ${event.price}` : ""}
          </Text>
        </View>
        {event.image ? (
          <Image source={{ uri: event.image }} style={styles.image} />
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderColor: theme.eventConcert,
    borderLeftWidth: 3,
    paddingLeft: 8,
  },
  copy: {
    flex: 1,
    paddingRight: 8,
  },
  time: {
    fontSize: 10,
    fontWeight: "500",
    color: theme.textSecondary,
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
  image: {
    height: 63,
    width: 63,
    borderRadius: 4,
  },
});
