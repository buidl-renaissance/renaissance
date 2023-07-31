import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import { decode } from "html-entities";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import RenderHtml from "react-native-render-html";
import Icon, { IconTypes } from "../Components/Icon";
import { DAEvent } from "../interfaces";
import { getBookmarkStatus, toggleBookmark } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

export interface EventCardOptions {
  showBookmark?: boolean;
  showDate?: boolean;
  showVenue?: boolean;
}

export const formatTime = (date) => {
  const now = moment(date);
  const duration = moment.duration(now);
  const hours = duration.asHours();
  return moment(date).format("h:mm a");
};

export const formatTimeRange = (event) => {
  return `${formatTime(event.start_date)} - ${formatTime(event.end_date)}`;
};

const organizedByText = (event) => {
  const organizers = event.organizer
    ?.map((organizer) => decode(organizer.organizer))
    .join(", ");
  return `Organized by: ${organizers}`;
};

interface EventCardProps {
  event: DAEvent;
  options?: EventCardOptions;
  onSelectEvent?: () => void;
}

export const EventCard = ({
  event,
  options = { showVenue: true },
  onSelectEvent,
}: EventCardProps) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(event.start_date);
    const end = moment(event.end_date);
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.start_date, event.end_date, isNow, setIsNow]);

  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id) {
        // console.log("DID UPDATE BOOKMARK: ", data.event.id, data.isBookmarked)
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === 'string') EventRegister.removeEventListener(listener);
    };
  });

  React.useEffect(() => {
    (async () => {
      const isBookmarked = await getBookmarkStatus(event);
      setIsBookmarked(isBookmarked);
    })();
  }, []);

  const handleBookmarkPress = React.useCallback(() => {
    (async () => {
      await toggleBookmark(event);
      EventRegister.emitEvent("BookmarkEvent", {
        event,
        isBookmarked: !isBookmarked,
      });
    })();
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: event?.featured ? "#3449ff" : "white",
            borderLeftWidth: 3,
            paddingLeft: 6,
            marginLeft: -8,
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
                    color: "#666",
                    textAlign: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {formatMonth(event.start_date)}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: "bold",
                    fontSize: 22,
                    textAlign: "center",
                  }}
                >
                  {formatDay(event.start_date)}
                </Text>
              </View>
            )}
            <View
              style={{ flex: 1, alignItems: "center", flexDirection: "row" }}
            >
              <View>
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
                          backgroundColor: "blue",
                          color: "white",
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
                </View>
                <Text
                  style={[
                    styles.title,
                    { fontSize: event.id === 2673 ? 18 : 16 },
                  ]}
                  numberOfLines={2}
                >
                  {decode(event.title)}
                </Text>
                {event.venue && options?.showVenue && (
                  <Text style={styles.subtitle}>{event.venue.title}</Text>
                )}
                {event.organizer?.[0] && (
                  <Text style={styles.subtitle}>{organizedByText(event)}</Text>
                )}
                {/* <View style={styles.tagsContainer}>
                          {event?.categories?.map((event) => {
                              return (<Text style={styles.chip}>{event.name}</Text>);
                          })}
                      </View> */}
                {event?.excerpt && (
                  <View style={{ marginVertical: 4 }}>
                    <RenderHtml
                      tagsStyles={{ p: { padding: 0, margin: 0 } }}
                      contentWidth={100}
                      source={{ html: `<i>${event?.excerpt}</i>` }}
                    />
                  </View>
                )}
              </View>
            </View>
            {/* <Text style={{ marginTop: 4 }}>September 30 @ 5:30 pm - 9:00 pm</Text> */}
          </View>
        </TouchableOpacity>
        {options.showBookmark && (
          <TouchableOpacity
            style={{
              opacity: 1,
              borderColor: isBookmarked ? "blue" : "#999",
              borderRadius: 14,
              borderWidth: 1,
              padding: 6,
              margin: 16,
            }}
            onPress={handleBookmarkPress}
          >
            <Icon
              type={IconTypes.Ionicons}
              size={14}
              color={isBookmarked ? "blue" : "#999"}
              name={isBookmarked ? "bookmark-sharp" : "bookmark-outline"}
            />
          </TouchableOpacity>
        )}
        {/* <Image
                source={require('../../assets/hunt-street-station.png')}
                style={{
                    resizeMode: 'contain',
                    height: 60,
                    width: 60,
                    margin: 4,
                }}
            /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 4,
    // borderBottomColor: "#bcd0c7",
    paddingHorizontal: 0,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    width: "auto",
    fontWeight: "500",
  },
  tagsContainer: {
    paddingVertical: 4,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  chip: {
    color: "#28303d",
    borderColor: "#28303d",
    borderWidth: 1,
    paddingHorizontal: 4,
    // paddingVertical: 1,
    marginTop: 4,
    marginRight: 4,
    marginBottom: 4,
  },
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
