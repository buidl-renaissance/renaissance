import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { InstagramEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";

export interface InstagramEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showVenue?: boolean;
  showArtists?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: InstagramEvent) => {
  const start = formatTime(event.startDatetime);
  if (event.endDatetime) {
    return `${start} - ${formatTime(event.endDatetime)}`;
  }
  return start;
};

interface InstagramEventCardProps {
  children?: any;
  event: InstagramEvent;
  options?: InstagramEventCardOptions;
  onSelectEvent?: () => void;
}

export const InstagramEventCard: React.FC<InstagramEventCardProps> = ({
  children,
  event,
  options = { showVenue: true, showImage: true, showArtists: true },
  onSelectEvent,
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(event.startDatetime);
    const end = event.endDatetime ? moment(event.endDatetime) : moment(event.startDatetime).add(4, 'hours');
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.startDatetime, event.endDatetime]);

  // Load bookmark status
  React.useEffect(() => {
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'instagram');
      setIsBookmarked(bookmarked);
    })();
  }, [event]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id || (data.event?.eventType === 'instagram' && data.event?.id === event.id)) {
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
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'instagram');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'instagram' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const artistsText = event.artistNames
    ?.slice(0, 3)
    .join(", ");

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: theme.eventInstagram,
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
                  {formatMonth(event.startDatetime)}
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
                  {formatDay(event.startDatetime)}
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
                  {event.metadata?.price && (
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
                      {event.metadata.price}
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
                {event.venue && options?.showVenue && (
                  <Text style={styles.subtitle}>{event.venue}</Text>
                )}
                {event.location && options?.showVenue && (
                  <Text style={[styles.subtitle, { fontSize: 11, color: theme.textSecondary }]}>
                    {event.location}
                  </Text>
                )}
                {artistsText && options?.showArtists && (
                  <Text style={[styles.subtitle, { fontSize: 11, color: theme.text }]}>
                    {artistsText}
                    {event.artistNames.length > 3 && ` +${event.artistNames.length - 3} more`}
                  </Text>
                )}
                {event.metadata?.additionalInfo && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: theme.textTertiary }]}>
                    {event.metadata.additionalInfo}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {options.showImage && event.imageUrl && (
          <TouchableOpacity style={{ padding: 8 }} onPress={onSelectEvent}>
            <Image
              source={{
                uri: event.imageUrl,
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
});

