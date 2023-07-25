import React from "react";
import { StyleSheet, Image, Text, View } from "react-native";
import { decode } from "html-entities";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";

export interface EventCardOptions {
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

export const EventCard = ({
  event,
  options = { showDate: false, showVenue: true },
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(event.start_date);
    const end = moment(event.end_date);
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    }
  }, [event.start_date, event.end_date, isNow, setIsNow]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ paddingVertical: 6, flex: 1, flexDirection: "row" }}>
          {options?.showDate && (
            <View
              style={{
                width: options?.showDate ? 52 : 8,
                alignItems: "center",
                borderColor: event.id === 2673 ? "#3449ff" : "white",
                borderLeftWidth: 3,
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
          <View style={{ flex: 1, alignItems: "center", flexDirection: "row" }}>
            <View>
              <View
                style={{ flex: 1, alignItems: "center", flexDirection: "row" }}
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
            </View>
          </View>
          {/* <Text style={{ marginTop: 4 }}>September 30 @ 5:30 pm - 9:00 pm</Text> */}
        </View>
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
      {event.id === 2673 && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              color: "black",
              fontSize: 11,
              textAlign: "left",
              fontStyle: "italic",
              paddingBottom: 8,
            }}
          >
            Yoga with Soojin Kim, 7:15-8. Sally B's Tacos. Photography
            Retrospective. Live Art by Robin Speth and Martina Sanroman.
          </Text>
        </View>
      )}
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
