import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { theme } from "../colors";
import type { EthDenverEvent } from "../hooks/useEthDenverEvents";

interface EthDenverEventCardProps {
  event: EthDenverEvent;
  onSelectEvent?: () => void;
}

export function EthDenverEventCard({ event, onSelectEvent }: EthDenverEventCardProps) {
  const dateLabel = moment(event.eventDate).format("MMM D");
  const timeLabel = event.startTime || "";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelectEvent}
      activeOpacity={0.8}
    >
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.eventName}
        </Text>
        {event.venue ? (
          <Text style={styles.venue} numberOfLines={1}>
            {event.venue}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.date}>{dateLabel}</Text>
          {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  leftBorder: {
    width: 4,
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  venue: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: theme.textTertiary,
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    color: theme.textTertiary,
  },
});
