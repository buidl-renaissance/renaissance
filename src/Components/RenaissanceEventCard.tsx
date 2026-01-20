import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { RenaissanceEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";
import { ConnectionBookmarkUser } from "../api/bookmarks";
import { ConnectionAvatars } from "./ConnectionAvatars";

export interface RenaissanceEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showVenue?: boolean;
  showHost?: boolean;
  showTags?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: RenaissanceEvent) => {
  const start = formatTime(event.startTime);
  const end = formatTime(event.endTime);
  return `${start} - ${end}`;
};

interface RenaissanceEventCardProps {
  children?: any;
  event: RenaissanceEvent;
  options?: RenaissanceEventCardOptions;
  onSelectEvent?: () => void;
  initialBookmarkStatus?: boolean;
  /** Connections who have bookmarked this event */
  connections?: ConnectionBookmarkUser[];
}

export const RenaissanceEventCard: React.FC<RenaissanceEventCardProps> = ({
  children,
  event,
  options = { showVenue: true, showImage: true, showHost: true, showTags: false },
  onSelectEvent,
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
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'renaissance');
      setIsBookmarked(bookmarked);
    })();
  }, [event, initialBookmarkStatus]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id || (data.event?.eventType === 'renaissance' && data.event?.id === event.id)) {
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
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'renaissance');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'renaissance' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const hostName = event.metadata?.host?.name;
  const bookingType = event.metadata?.bookingType;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: theme.eventRenaissance,
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
                  {bookingType && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: theme.eventRenaissance,
                          color: "#fff",
                          borderRadius: 4,
                          paddingHorizontal: 3,
                          paddingVertical: 1,
                          marginLeft: 3,
                          overflow: "hidden",
                          textTransform: "capitalize",
                        },
                      ]}
                    >
                      {bookingType.replace(/_/g, " ")}
                    </Text>
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
                  {event.name}
                </Text>
                {event.location && options?.showVenue && (
                  <Text style={styles.subtitle}>{event.location}</Text>
                )}
                {hostName && options?.showHost && (
                  <Text style={[styles.subtitle, { fontSize: 11, color: theme.text }]}>
                    Hosted by {hostName}
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
        {options.showImage && event.flyerImage && (
          <TouchableOpacity style={{ padding: 8 }} onPress={onSelectEvent}>
            <Image
              source={{
                uri: event.flyerImage,
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
