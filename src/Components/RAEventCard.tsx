import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { RAEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";
import { ConnectionBookmarkUser } from "../api/bookmarks";
import { ConnectionAvatars } from "./ConnectionAvatars";

export interface RAEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showVenue?: boolean;
  showArtists?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: RAEvent) => {
  return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
};

interface RAEventCardProps {
  children?: any;
  event: RAEvent;
  options?: RAEventCardOptions;
  onSelectEvent?: () => void;
  isFeatured?: boolean;
  initialBookmarkStatus?: boolean;
  /** Connections who have bookmarked this event */
  connections?: ConnectionBookmarkUser[];
}

export const RAEventCard: React.FC<RAEventCardProps> = ({
  children,
  event,
  options = { showVenue: true, showImage: true, showArtists: true },
  onSelectEvent,
  isFeatured = false,
  initialBookmarkStatus,
  connections = [],
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(initialBookmarkStatus ?? false);

  React.useEffect(() => {
    const start = moment(event.startTime);
    const end = moment(event.endTime);
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.startTime, event.endTime]);

  // Load bookmark status (skip if initialBookmarkStatus was provided)
  React.useEffect(() => {
    if (initialBookmarkStatus !== undefined) return;
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'ra');
      setIsBookmarked(bookmarked);
    })();
  }, [event, initialBookmarkStatus]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id || (data.event?.eventType === 'ra' && data.event?.id === event.id)) {
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [event]);

  const handleBookmarkBadgePress = React.useCallback(async (e: any) => {
    e.stopPropagation();
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'ra');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'ra' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const artistsText = event.artists
    ?.slice(0, 3)
    .map((artist) => artist.name)
    .join(", ");

  const flyerImage = event.images?.find((img) => img.type === "FLYERFRONT");

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: isFeatured ? theme.eventFeatured : theme.eventRA,
            borderLeftWidth: 3,
            paddingLeft: 6,
            marginLeft: -8,
            paddingRight: 8,
          }}
          onPress={onSelectEvent}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          >
            {options?.showDate && (
              <View
                style={{
                  width: options?.showDate ? 52 : 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    marginTop: 2,
                    color: theme.textSecondary,
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {formatMonth(event.startTime)}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: "bold",
                    fontSize: 22,
                    textAlign: "center",
                    color: theme.text,
                  }}
                >
                  {formatDay(event.startTime)}
                </Text>
              </View>
            )}
            <View
              style={{ flex: 1, alignItems: "center", flexDirection: "row" }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Text style={[styles.subtitle, { fontSize: 10 }]}>
                    {formatTimeRange(event)}
                  </Text>
                  {event.isTicketed && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: theme.warning,
                          color: theme.textOnWarning,
                          borderRadius: 4,
                          paddingHorizontal: 3,
                          paddingVertical: 1,
                          marginLeft: 3,
                          overflow: "hidden",
                        },
                      ]}
                    >
                      TICKETS
                    </Text>
                  )}
                  {/* <View
                    style={{
                      backgroundColor: "#7c3aed",
                      borderRadius: 4,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      marginLeft: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: theme.textOnPrimary,
                        fontWeight: "600",
                      }}
                    >
                      RA
                    </Text>
                  </View> */}
                  {isFeatured && (
                    <View
                      style={{
                        backgroundColor: theme.success,
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        marginLeft: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          color: theme.textOnSuccess,
                          fontWeight: "600",
                        }}
                      >
                        activation
                      </Text>
                    </View>
                  )}
                  {isNow && (
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#ef4444",
                        fontWeight: "700",
                        marginLeft: 4,
                      }}
                    >
                      NOW
                    </Text>
                  )}
                  {isBookmarked && (
                    <TouchableOpacity
                      onPress={handleBookmarkBadgePress}
                      style={styles.bookmarkBadge}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        type={IconTypes.Ionicons}
                        size={14}
                        color={theme.primary}
                        name="bookmark"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  style={[styles.title, { fontSize: 18 }]}
                  numberOfLines={2}
                >
                  {event.title}
                </Text>
                {event.venue && options?.showVenue && (
                  <Text style={styles.subtitle}>{event.venue.name}</Text>
                )}
                {artistsText && options?.showArtists && (
                  <Text style={[styles.subtitle, { fontSize: 11, color: theme.text }]}>
                    {artistsText}
                    {event.artists.length > 3 && ` +${event.artists.length - 3} more`}
                  </Text>
                )}
                {event.interestedCount !== null && event.interestedCount > 0 && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: theme.textTertiary }]}>
                    {event.interestedCount} interested
                  </Text>
                )}
                {connections.length > 0 && (
                  <View style={styles.connectionsContainer}>
                    <ConnectionAvatars
                      connections={connections}
                      size={18}
                      maxDisplay={3}
                      showLabel={true}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {options.showImage && flyerImage && (
          <TouchableOpacity style={{ padding: 8 }} onPress={onSelectEvent}>
            <Image
              source={{
                uri: flyerImage.filename,
              }}
              style={{
                height: 63,
                width: 63,
                resizeMode: "cover",
                borderRadius: 4,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  subtitle: {
    fontSize: 12,
    width: "auto",
    fontWeight: "500",
    color: theme.textSecondary,
  },
  bookmarkBadge: {
    marginLeft: 6,
    padding: 2,
  },
  connectionsContainer: {
    marginTop: 4,
  },
});

