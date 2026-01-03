import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import moment from "moment";
import { theme } from "../colors";

interface DayForecast {
  date: moment.Moment;
  dateKey: string;
  eventCount: number;
  isToday: boolean;
  bookmarkedCount: number;
  goingCount: number;
}

interface EventForecastProps {
  days: DayForecast[];
  onDayPress: (dateKey: string) => void;
}

export const EventForecast: React.FC<EventForecastProps> = ({ days, onDayPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.dateKey}
            style={styles.dayContainer}
            onPress={() => onDayPress(day.dateKey)}
            activeOpacity={0.7}
          >
            <Text style={styles.dayName}>
              {day.isToday ? "TODAY" : day.date.format("ddd")}
            </Text>
            <View
              style={[
                styles.dateBadge,
                day.isToday && styles.dateBadgeToday,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  day.isToday && styles.dateTextToday,
                ]}
              >
                {day.date.format("D")}
              </Text>
            </View>
            {day.bookmarkedCount > 0 && (
              <Text style={styles.eventCount}>
                {`${day.bookmarkedCount} ${day.bookmarkedCount === 1 ? "event" : "events"}`}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  dateBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dateBadgeToday: {
    backgroundColor: theme.accent,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.text,
  },
  dateTextToday: {
    color: theme.textOnPrimary,
  },
  eventCount: {
    fontSize: 9,
    color: theme.textSecondary,
    textAlign: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    gap: 4,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  goingBadge: {
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.text,
  },
  goingBadgeText: {
    color: theme.textOnSuccess,
  },
});

