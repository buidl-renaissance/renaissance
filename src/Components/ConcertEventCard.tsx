import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { ConcertEvent } from "../interfaces";
import { theme } from "../colors";

const SOURCE_LABELS: Record<ConcertEvent["source"], string> = {
  dice: "Dice",
  ticketmaster: "Ticketmaster",
  seatgeek: "SeatGeek",
  "el-club": "El Club",
  "lager-house": "The Lager House",
  "cliff-bells": "Cliff Bell's",
  "marble-bar": "The Marble Bar",
  russell: "Russell Industrial Center",
  "sharpen-your-skills": "Sharpen Your Skills",
};

interface ConcertEventCardProps {
  event: ConcertEvent;
  onSelectEvent?: (url?: string) => void;
}

export const ConcertEventCard: React.FC<ConcertEventCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const isNow = moment(event.startTime).isBefore() && moment(event.endTime || event.startTime).add(event.endTime ? 0 : 3, "hours").isAfter();
  const offers = event.offers?.length
    ? event.offers
    : [{ source: event.source, url: event.url, price: event.price }];
  const prefixed = event.name.match(/^(Canceled|Cancelled|Postponed|Rescheduled):\s*/i);
  const statusLabel = event.status === 'canceled' || prefixed?.[1]?.toLowerCase().startsWith('cancel')
    ? 'Canceled'
    : event.status === 'postponed' || prefixed?.[1]?.toLowerCase().startsWith('postpon')
      ? 'Postponed'
      : event.status === 'rescheduled' || prefixed?.[1]?.toLowerCase().startsWith('reschedul')
        ? 'Rescheduled'
        : null;
  const title = event.name.replace(/^(Canceled|Cancelled|Postponed|Rescheduled):\s*/i, '');

  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <TouchableOpacity onPress={() => onSelectEvent?.()}>
              <View style={styles.timeRow}>
                <Text style={styles.time}>
                  {moment(event.startTime).format("h:mm a")}
                  {isNow && !statusLabel ? "  NOW" : ""}
                </Text>
                {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
              </View>
              <Text style={[styles.title, statusLabel === 'Canceled' ? styles.canceledTitle : null]} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.subtitle}>
                {event.venue}{event.city ? `, ${event.city}` : ""}
              </Text>
            </TouchableOpacity>
            {offers.map((offer) => (
              <TouchableOpacity
                key={offer.source}
                onPress={() => onSelectEvent?.(offer.url)}
                hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
              >
                <Text style={styles.subtitle}>
                  {SOURCE_LABELS[offer.source]}{offer.price ? ` · ${offer.price}` : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {event.image ? (
          <TouchableOpacity style={styles.imageWrap} onPress={() => onSelectEvent?.()}>
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
    borderColor: theme.eventConcert,
    borderLeftWidth: 3,
    paddingLeft: 6,
    marginLeft: -8,
    paddingRight: 8,
  },
  imageWrap: {
    padding: 8,
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
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    marginLeft: 6,
    overflow: "hidden",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: theme.textOnWarning,
    backgroundColor: theme.warning,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  canceledTitle: {
    textDecorationLine: "line-through",
    color: theme.textSecondary,
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
