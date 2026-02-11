import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { theme } from "../colors";
import type { EthDenverEvent } from "../hooks/useEthDenverEvents";

export interface EthDenverEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showOrganizer?: boolean;
  showNotes?: boolean;
}

interface EthDenverEventCardProps {
  event: EthDenverEvent;
  options?: EthDenverEventCardOptions;
  onSelectEvent?: () => void;
}

function parseStartEnd(event: EthDenverEvent): { start: moment.Moment; end: moment.Moment } | null {
  const dateStr = event.eventDate;
  const startStr = event.startTime;
  if (!dateStr || !startStr) return null;
  const start = moment(`${dateStr} ${startStr}`, ["YYYY-MM-DD h:mm a", "YYYY-MM-DD h:mma", "YYYY-MM-DD ha"]);
  if (!start.isValid()) return null;
  let end: moment.Moment;
  if (event.endTime) {
    end = moment(`${dateStr} ${event.endTime}`, ["YYYY-MM-DD h:mm a", "YYYY-MM-DD h:mma", "YYYY-MM-DD ha"]);
    if (!end.isValid()) end = start.clone().add(2, "hours");
    else if (end.isSameOrBefore(start)) end.add(1, "day");
  } else {
    end = start.clone().add(2, "hours");
  }
  return { start, end };
}

export function EthDenverEventCard({
  event,
  options = { showDate: false, showImage: true, showOrganizer: true, showNotes: true },
  onSelectEvent,
}: EthDenverEventCardProps) {
  const [isNow, setIsNow] = React.useState(false);
  const timeLabel = event.endTime
    ? `${event.startTime || ""} - ${event.endTime}`.trim()
    : (event.startTime || "");
  const dateM = moment(event.eventDate, "YYYY-MM-DD");
  const dateMonth = dateM.format("MMM");
  const dateDay = dateM.format("D");

  React.useEffect(() => {
    const parsed = parseStartEnd(event);
    if (!parsed) {
      setIsNow(false);
      return;
    }
    const { start, end } = parsed;
    setIsNow(start.isBefore() && end.isAfter());
  }, [event.eventDate, event.startTime, event.endTime]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.touchable, styles.leftBorder]}
          onPress={onSelectEvent}
          activeOpacity={0.8}
        >
          {options.showDate && (
            <View style={styles.dateColumn}>
              <Text style={styles.dateMonth}>{dateMonth}</Text>
              <Text style={styles.dateDay}>{dateDay}</Text>
            </View>
          )}
          <View style={styles.content}>
            <View style={styles.timeRow}>
              {timeLabel ? (
                <Text style={styles.subtitle}>{timeLabel}</Text>
              ) : null}
              {isNow && (
                <Text style={styles.nowBadge}>NOW</Text>
              )}
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {event.eventName}
            </Text>
            {event.venue ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {event.venue}
              </Text>
            ) : null}
            {event.organizer && options.showOrganizer ? (
              <Text style={[styles.subtitle, styles.organizer]} numberOfLines={1}>
                {event.organizer}
              </Text>
            ) : null}
            {event.notes && options.showNotes ? (
              <Text style={[styles.subtitle, styles.notes]} numberOfLines={2}>
                {event.notes}
              </Text>
            ) : null}
            {event.attendeeCount != null && event.attendeeCount > 0 && (
              <Text style={[styles.subtitle, styles.count]}>
                {event.attendeeCount} {event.attendeeCount === 1 ? "attendee" : "attendees"}
              </Text>
            )}
            {event.interestedCount != null && event.interestedCount > 0 && (
              <Text style={[styles.subtitle, styles.count]}>
                {event.interestedCount} interested
              </Text>
            )}
          </View>
        </TouchableOpacity>
        {options.showImage && event.imageUrl ? (
          <TouchableOpacity style={styles.imageWrap} onPress={onSelectEvent}>
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  touchable: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 6,
    paddingLeft: 6,
    marginLeft: -8,
    paddingRight: 8,
  },
  leftBorder: {
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
    borderRadius: 0,
  },
  dateColumn: {
    width: 52,
    alignItems: "center",
  },
  dateMonth: {
    marginTop: 2,
    color: theme.textSecondary,
    fontSize: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  dateDay: {
    marginTop: 2,
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    color: theme.text,
  },
  content: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.textSecondary,
    marginBottom: 2,
  },
  nowBadge: {
    fontSize: 8,
    fontWeight: "700",
    color: "#ef4444",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  organizer: {
    fontSize: 11,
    color: theme.text,
  },
  notes: {
    fontSize: 11,
    color: theme.textTertiary,
  },
  count: {
    fontSize: 10,
    color: theme.textTertiary,
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
