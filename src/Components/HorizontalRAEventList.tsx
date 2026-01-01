import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { RAEvent } from "../interfaces";

const { width } = Dimensions.get("window");

export interface HorizontalRAEventListProps {
  events: RAEvent[];
  loading: boolean;
  emptyMessage?: string;
  onEventPress: (event: RAEvent) => void;
  cardWidth?: number;
}

export const HorizontalRAEventList: React.FC<HorizontalRAEventListProps> = ({
  events,
  loading,
  emptyMessage = "No events available",
  onEventPress,
  cardWidth = width * 0.35,
}) => {
  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {[1, 2, 3].map((index) => (
          <View key={index} style={[styles.cardContainer, { width: cardWidth }]}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (events.length === 0) {
    return (
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {events.map((raEvent) => {
        const flyerImage =
          raEvent.images?.find((img) => img.type === "FLYERFRONT")
            ?.filename || raEvent.flyerFront;

        return (
          <TouchableOpacity
            key={raEvent.id}
            onPress={() => onEventPress(raEvent)}
            activeOpacity={0.85}
            style={[styles.cardContainer, { width: cardWidth }]}
          >
            {flyerImage && (
              <Image
                source={{ uri: flyerImage }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.eventInfo}>
              {raEvent.interestedCount !== null &&
                raEvent.interestedCount > 0 && (
                  <Text style={styles.interestedText}>
                    {raEvent.interestedCount} interested
                  </Text>
                )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginRight: 12,
  },
  eventImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#111",
  },
  eventInfo: {
    marginTop: 8,
  },
  interestedText: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
  skeletonImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  skeletonText: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
  },
  emptyText: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 16,
  },
});

