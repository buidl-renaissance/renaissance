import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { MeetupEvent } from "../interfaces";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";
import { ConnectionBookmarkUser } from "../api/bookmarks";
import { ConnectionAvatars } from "./ConnectionAvatars";

export interface MeetupEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showLocation?: boolean;
  showGroup?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: MeetupEvent) => {
  const start = formatTime(event.dateTime);
  // Since we don't have an end time, just show start time
  return start;
};

interface MeetupEventCardProps {
  children?: any;
  event: MeetupEvent;
  options?: MeetupEventCardOptions;
  onSelectEvent?: () => void;
  initialBookmarkStatus?: boolean;
  /** Connections who have bookmarked this event */
  connections?: ConnectionBookmarkUser[];
}

export const MeetupEventCard: React.FC<MeetupEventCardProps> = ({
  children,
  event,
  options = { showLocation: true, showImage: true, showGroup: true },
  onSelectEvent,
  initialBookmarkStatus,
  connections = [],
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(initialBookmarkStatus ?? false);

  React.useEffect(() => {
    const start = moment(event.dateTime);
    // Since we don't have end time, assume event lasts 2 hours
    const end = moment(event.dateTime).add(2, 'hours');
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.dateTime]);

  // Load bookmark status (skip if initialBookmarkStatus was provided)
  React.useEffect(() => {
    if (initialBookmarkStatus !== undefined) return;
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(event, 'meetup');
      setIsBookmarked(bookmarked);
    })();
  }, [event, initialBookmarkStatus]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.eventId === data.event?.eventId || (data.event?.eventType === 'meetup' && data.event?.eventId === event.eventId)) {
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
    const newBookmarkStatus = await toggleBookmarkForWebEvent(event, 'meetup');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...event, eventType: 'meetup' },
      isBookmarked: newBookmarkStatus,
    });
  }, [event]);

  const venueText = event.venue
    ? `${event.venue.name}${event.venue.city ? `, ${event.venue.city}` : ''}`
    : null;

  // Default to event image, fallback to group image
  // Access featuredEventPhoto from eventData (nested structure)
  const eventData = (event as any).eventData;
  const eventImageUrl = eventData?.featuredEventPhoto?.highResUrl || eventData?.featuredEventPhoto?.baseUrl;
  const groupPhotoUrl = event.group?.keyGroupPhoto?.highResUrl;
  const imageUrl = eventImageUrl || groupPhotoUrl;

  // Get attendee count from RSVPs - access from eventData
  const rsvps = eventData?.rsvps;
  const attendeeCount = rsvps?.totalCount;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: theme.eventMeetup,
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
                  {formatMonth(event.dateTime)}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: "bold",
                    fontSize: 22,
                    textAlign: "center",
                  }}
                >
                  {formatDay(event.dateTime)}
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
                  {isNow && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: theme.eventMeetup,
                          color: theme.textOnPrimary,
                          borderRadius: 4,
                          paddingHorizontal: 3,
                          paddingVertical: 1,
                          marginLeft: 3,
                          overflow: "hidden",
                        },
                      ]}
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
                {venueText && options?.showLocation && (
                  <Text style={styles.subtitle}>{venueText}</Text>
                )}
                {event.venue?.address && options?.showLocation && (
                  <Text style={[styles.subtitle, { fontSize: 10 }]}>
                    {event.venue.address}
                  </Text>
                )}
                {event.group?.name && options?.showGroup && (
                  <Text style={styles.subtitle}>Group: {event.group.name}</Text>
                )}
                {attendeeCount !== null && attendeeCount !== undefined && attendeeCount > 0 && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: theme.textTertiary }]}>
                    {attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}
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
        {options.showImage && imageUrl && (
          <TouchableOpacity style={{ padding: 8 }} onPress={onSelectEvent}>
            <Image
              source={{
                uri: imageUrl,
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

