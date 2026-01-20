import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { RenaissanceEvent } from "../interfaces";
import { theme } from "../colors";
import Icon, { IconTypes } from "../Components/Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

const { width } = Dimensions.get("window");

interface RenaissanceEventScreenProps {
  navigation: any;
  route: {
    params: {
      event: RenaissanceEvent;
    };
  };
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatDate = (date: string) => {
  return moment(date).format("dddd, MMMM D, YYYY");
};

const RenaissanceEventScreen: React.FC<RenaissanceEventScreenProps> = ({
  navigation,
  route,
}) => {
  const event = route.params?.event;
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  React.useEffect(() => {
    navigation.setOptions({
      title: event?.name || "Event Details",
      headerStyle: {
        backgroundColor: theme.background,
      },
      headerTintColor: theme.text,
    });
  }, [navigation, event]);

  // Load bookmark status
  React.useEffect(() => {
    if (!event) return;
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'renaissance');
      setIsBookmarked(bookmarked);
    })();
  }, [event]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event?.id === data.event?.id && data.event?.eventType === 'renaissance') {
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [event]);

  const handleBookmarkPress = React.useCallback(async () => {
    if (!event) return;
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'renaissance');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'renaissance' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const handleViewInDJQ = React.useCallback(() => {
    if (!event) return;
    const url = event.metadata?.djqEventId
      ? `https://djq.builddetroit.xyz/events/${event.metadata.djqEventId}`
      : `https://djq.builddetroit.xyz/dashboard`;
    navigation.push("MiniApp", {
      url,
      title: "DJQ",
      emoji: "🎧",
    });
  }, [event, navigation]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hostName = event.metadata?.host?.name;
  const hostUsername = event.metadata?.host?.username;
  const bookingType = event.metadata?.bookingType;
  const description = event.metadata?.description;
  const slotDuration = event.metadata?.slotDurationMinutes;
  const allowB2B = event.metadata?.allowB2B;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {event.flyerImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.flyerImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Event Name */}
          <Text style={styles.eventName}>{event.name}</Text>

          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="calendar-outline"
                  size={20}
                  color={theme.eventRenaissance}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoText}>{formatDate(event.startTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="time-outline"
                  size={20}
                  color={theme.eventRenaissance}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoText}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="location-outline"
                  size={20}
                  color={theme.eventRenaissance}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoText}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Host Info */}
          {hostName && (
            <View style={styles.hostCard}>
              <View style={styles.hostAvatar}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="person"
                  size={24}
                  color={theme.eventRenaissance}
                />
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostLabel}>Hosted by</Text>
                <Text style={styles.hostName}>{hostName}</Text>
                {hostUsername && (
                  <Text style={styles.hostUsername}>@{hostUsername}</Text>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {/* Event Details */}
          {(bookingType || slotDuration) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <View style={styles.detailsGrid}>
                {bookingType && (
                  <View style={styles.detailItem}>
                    <View style={styles.detailBadge}>
                      <Icon
                        type={IconTypes.Ionicons}
                        name="musical-notes"
                        size={14}
                        color="#fff"
                      />
                      <Text style={styles.detailBadgeText}>
                        {bookingType.replace(/_/g, " ")}
                      </Text>
                    </View>
                  </View>
                )}
                {slotDuration && (
                  <View style={styles.detailItem}>
                    <View style={[styles.detailBadge, { backgroundColor: theme.info }]}>
                      <Icon
                        type={IconTypes.Ionicons}
                        name="timer-outline"
                        size={14}
                        color="#fff"
                      />
                      <Text style={styles.detailBadgeText}>
                        {slotDuration} min sets
                      </Text>
                    </View>
                  </View>
                )}
                {allowB2B && (
                  <View style={styles.detailItem}>
                    <View style={[styles.detailBadge, { backgroundColor: theme.success }]}>
                      <Icon
                        type={IconTypes.Ionicons}
                        name="people-outline"
                        size={14}
                        color="#fff"
                      />
                      <Text style={styles.detailBadgeText}>B2B Allowed</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkPress}
        >
          <Icon
            type={IconTypes.Ionicons}
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked ? theme.primary : theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewInDJQ}
        >
          <Icon
            type={IconTypes.Ionicons}
            name="musical-notes"
            size={20}
            color="#fff"
          />
          <Text style={styles.primaryButtonText}>View in DJQ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
  imageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  content: {
    padding: 20,
  },
  eventName: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: theme.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.eventRenaissance}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 15,
    color: theme.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 4,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.eventRenaissance}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  hostInfo: {
    flex: 1,
  },
  hostLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  hostName: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.text,
  },
  hostUsername: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailItem: {},
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.eventRenaissance,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tagText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  bookmarkButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.eventRenaissance,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RenaissanceEventScreen;
