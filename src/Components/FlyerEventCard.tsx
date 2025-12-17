import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";

interface FlyerEventCardProps {
  event: any;
  onSelectEvent?: () => void;
}

export const FlyerEventCard: React.FC<FlyerEventCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const startTime = moment(event.start_date).format("h:mm a");
  const endTime = moment(event.end_date).format("h:mm a");
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelectEvent}
      activeOpacity={0.7}
    >
      <View style={styles.timeBar} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {startTime} - {endTime}
          </Text>
          {event.venue && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.venue} numberOfLines={1}>
                {event.venue.title}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#4285f4",
    borderRadius: 4,
    overflow: "hidden",
    minHeight: 48,
  },
  timeBar: {
    width: 4,
    backgroundColor: "#1967d2",
  },
  content: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  time: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  separator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginHorizontal: 6,
  },
  venue: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    flex: 1,
  },
});

