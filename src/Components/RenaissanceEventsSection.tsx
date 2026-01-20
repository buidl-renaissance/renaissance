import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import moment from "moment";
import { RenaissanceEvent } from "../interfaces";
import { theme } from "../colors";
import Icon, { IconTypes } from "./Icon";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.4;

interface RenaissanceEventsSectionProps {
  events: RenaissanceEvent[];
  onEventPress: (event: RenaissanceEvent) => void;
  loading?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatDate = (date: string) => {
  return moment(date).format("ddd, MMM D");
};

export const RenaissanceEventsSection: React.FC<RenaissanceEventsSectionProps> = ({
  events,
  onEventPress,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon
              type={IconTypes.Ionicons}
              name="sparkles"
              size={18}
              color={theme.eventRenaissance}
            />
            <Text style={styles.sectionTitle}>RENAISSANCE CITY PRESENTS</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon
            type={IconTypes.Ionicons}
            name="sparkles"
            size={18}
            color={theme.eventRenaissance}
          />
          <Text style={styles.sectionTitle}>RENAISSANCE CITY EVENTS</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 10}
        snapToAlignment="start"
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            onPress={() => onEventPress(event)}
            activeOpacity={0.9}
          >
            {/* Image Section */}
            {event.flyerImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: event.flyerImage }}
                  style={styles.image}
                />
                <View style={styles.imageOverlay} />

                {/* Event info on image */}
                <View style={styles.imageContent}>
                  <Text style={styles.eventName} numberOfLines={2}>
                    {event.name}
                  </Text>
                  <Text style={styles.eventDate}>
                    {formatDate(event.startTime)} • {formatTime(event.startTime)}
                  </Text>
                </View>
              </View>
            )}

            {/* Details Section */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="location-outline"
                  size={12}
                  color={theme.eventRenaissance}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
              
              {event.metadata?.bookingType && (
                <View style={styles.bookingBadge}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="musical-notes"
                    size={9}
                    color="#fff"
                  />
                  <Text style={styles.bookingText}>
                    {event.metadata.bookingType.replace(/_/g, " ")}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.surfaceElevated,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border,
  },
  imageContainer: {
    height: 160,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  imageContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  eventName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventDate: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  detailsContainer: {
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: theme.text,
    fontWeight: "500",
    flex: 1,
  },
  hostText: {
    fontSize: 10,
    color: theme.textSecondary,
  },
  hostName: {
    color: theme.text,
    fontWeight: "500",
  },
  bookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.eventRenaissance,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
    marginTop: 2,
  },
  bookingText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
