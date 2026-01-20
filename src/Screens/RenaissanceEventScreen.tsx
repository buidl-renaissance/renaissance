import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
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
  const [imageAspectRatio, setImageAspectRatio] = React.useState<number>(1);

  // Get image dimensions to calculate aspect ratio
  React.useEffect(() => {
    if (event?.flyerImage) {
      Image.getSize(
        event.flyerImage,
        (imgWidth, imgHeight) => {
          if (imgHeight > 0) {
            setImageAspectRatio(imgWidth / imgHeight);
          }
        },
        (error) => {
          console.log("Error getting image size:", error);
        }
      );
    }
  }, [event?.flyerImage]);

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
        {/* Hero Image - Full Flyer */}
        {event.flyerImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.flyerImage }}
              style={[styles.heroImage, { aspectRatio: imageAspectRatio }]}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Content - Compact */}
        <View style={styles.content}>
          {/* Event Name */}
          <Text style={styles.eventName}>{event.name}</Text>

          {/* Compact Info Row */}
          <View style={styles.compactInfo}>
            <View style={styles.compactRow}>
              <Icon
                type={IconTypes.Ionicons}
                name="calendar-outline"
                size={16}
                color={theme.eventRenaissance}
              />
              <Text style={styles.compactText}>{formatDate(event.startTime)}</Text>
            </View>
            <View style={styles.compactRow}>
              <Icon
                type={IconTypes.Ionicons}
                name="time-outline"
                size={16}
                color={theme.eventRenaissance}
              />
              <Text style={styles.compactText}>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </Text>
            </View>
            <View style={styles.compactRow}>
              <Icon
                type={IconTypes.Ionicons}
                name="location-outline"
                size={16}
                color={theme.eventRenaissance}
              />
              <Text style={styles.compactText}>{event.location}</Text>
            </View>
            {hostName && (
              <View style={styles.compactRow}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="person-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text style={styles.compactText}>
                  Hosted by <Text style={styles.hostNameInline}>{hostName}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Badges Row */}
          {(bookingType || slotDuration || allowB2B || (event.tags && event.tags.length > 0)) && (
            <View style={styles.badgesRow}>
              {bookingType && (
                <View style={styles.detailBadge}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="musical-notes"
                    size={12}
                    color="#fff"
                  />
                  <Text style={styles.detailBadgeText}>
                    {bookingType.replace(/_/g, " ")}
                  </Text>
                </View>
              )}
              {slotDuration && (
                <View style={[styles.detailBadge, { backgroundColor: theme.info }]}>
                  <Icon
                    type={IconTypes.Ionicons}
                    name="timer-outline"
                    size={12}
                    color="#fff"
                  />
                  <Text style={styles.detailBadgeText}>
                    {slotDuration} min
                  </Text>
                </View>
              )}
              {allowB2B && (
                <View style={[styles.detailBadge, { backgroundColor: theme.success }]}>
                  <Text style={styles.detailBadgeText}>B2B</Text>
                </View>
              )}
              {event.tags && event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
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
    paddingBottom: 80,
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
    backgroundColor: theme.surface,
  },
  heroImage: {
    width: "100%",
  },
  content: {
    padding: 16,
  },
  eventName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 12,
  },
  compactInfo: {
    marginBottom: 12,
    gap: 6,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactText: {
    fontSize: 14,
    color: theme.text,
  },
  hostNameInline: {
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.eventRenaissance,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  detailBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tag: {
    backgroundColor: theme.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tagText: {
    color: theme.textSecondary,
    fontSize: 12,
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
