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
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

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

// Individual card component with bookmark state management
interface RenaissanceEventCardItemProps {
  event: RenaissanceEvent;
  onPress: () => void;
}

const RenaissanceEventCardItem: React.FC<RenaissanceEventCardItemProps> = ({
  event,
  onPress,
}) => {
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  // Load bookmark status
  React.useEffect(() => {
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'renaissance');
      setIsBookmarked(bookmarked);
    })();
  }, [event]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (data.event?.id === event.id && data.event?.eventType === 'renaissance') {
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [event.id]);

  const handleBookmarkPress = React.useCallback(async (e: any) => {
    e.stopPropagation();
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'renaissance');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'renaissance' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Full Flyer Image - No Overlay */}
      <View style={styles.imageContainer}>
        {event.flyerImage && (
          <Image
            source={{ uri: event.flyerImage }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Bookmark Button */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            type={IconTypes.Ionicons}
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={16}
            color={isBookmarked ? theme.primary : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Event Info Below Image */}
      <View style={styles.infoContainer}>
        <Text style={styles.eventName} numberOfLines={2}>
          {event.name}
        </Text>
        <Text style={styles.eventDate}>
          {formatDate(event.startTime)} • {formatTime(event.startTime)}
        </Text>
        <View style={styles.locationRow}>
          <Icon
            type={IconTypes.Ionicons}
            name="location-outline"
            size={11}
            color={theme.textSecondary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
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
          <RenaissanceEventCardItem
            key={event.id}
            event={event}
            onPress={() => onEventPress(event)}
          />
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
    height: 200,
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
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    height: 200,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.surface,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bookmarkButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  eventName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: theme.textSecondary,
    flex: 1,
  },
});
