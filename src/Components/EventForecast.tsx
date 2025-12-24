import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import moment from "moment";

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day.dateKey}
            style={styles.dayContainer}
            onPress={() => onDayPress(day.dateKey)}
            activeOpacity={0.7}
          >
            <Text style={styles.dayName}>
              {day.date.format("ddd")}
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
            <Text style={styles.eventCount}>
              {day.eventCount === 0
                ? "0"
                : `${day.eventCount} ${day.eventCount === 1 ? "event" : "events"}`}
            </Text>
            {(day.bookmarkedCount > 0 || day.goingCount > 0) && (
              <View style={styles.badgesContainer}>
                {day.bookmarkedCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{day.bookmarkedCount}</Text>
                  </View>
                )}
                {day.goingCount > 0 && (
                  <View style={[styles.badge, styles.goingBadge]}>
                    <Text style={[styles.badgeText, styles.goingBadgeText]}>
                      {day.goingCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  dayContainer: {
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 60,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dateBadgeToday: {
    backgroundColor: "#6366F1",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dateTextToday: {
    color: "white",
  },
  eventCount: {
    fontSize: 9,
    color: "#666",
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
    backgroundColor: "#E5E7EB",
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
    color: "#333",
  },
  goingBadgeText: {
    color: "white",
  },
});

