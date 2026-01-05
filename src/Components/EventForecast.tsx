import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
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
  const screenWidth = Dimensions.get("window").width;
  const pageGap = 16; // Extra gap between each group of 7 days (in addition to the 8px base margin)
  // Container padding: 12px on each side = 24px total
  // Margin between days: 8px * 6 gaps = 48px for 7 days
  const availableWidth = screenWidth - 24; // Container padding only
  const dayWidth = (availableWidth - 48) / 7; // Subtract margins for 7 days (6 gaps of 8px)
  const sevenDayWidth = dayWidth * 7 + 48; // Width of 7 days including 6 margins of 8px
  // Total width from start of page 1 to start of page 2: 7 days + 6 margins + 1 margin (8px) + gap (16px)
  const snapInterval = sevenDayWidth + 8 + pageGap; // Width of 7 days + base margin (8px) + gap (16px)
  
  // Calculate exact snap offsets for each page
  const snapOffsets = React.useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 1; i < 4; i++) {
      offsets.push(i * snapInterval);
    }
    return offsets;
  }, [snapInterval]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.dateKey}
            style={[
              styles.dayContainer,
              { width: dayWidth },
              // Add extra margin after every 7th day (except the last day) to create page gap
              (index + 1) % 7 === 0 && index < days.length - 1 && { marginRight: 8 + pageGap }
            ]}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: "row",
  },
  dayContainer: {
    alignItems: "center",
    marginRight: 8,
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

