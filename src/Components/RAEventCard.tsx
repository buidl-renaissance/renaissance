import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { RAEvent } from "../interfaces";

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
}

export const RAEventCard: React.FC<RAEventCardProps> = ({
  children,
  event,
  options = { showVenue: true, showImage: true, showArtists: true },
  onSelectEvent,
  isFeatured = false,
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(event.startTime);
    const end = moment(event.endTime);
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.startTime, event.endTime]);

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
            borderColor: isFeatured ? "#3449ff" : "#7c3aed",
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
                    color: "#666",
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
                  {isNow && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: "#7c3aed",
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
                  {event.isTicketed && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: "#f59e0b",
                          color: "white",
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
                  <View
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
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      RA
                    </Text>
                  </View>
                  {isFeatured && (
                    <View
                      style={{
                        backgroundColor: "#10b981",
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        marginLeft: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          color: "white",
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
                      LIVE
                    </Text>
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
                  <Text style={[styles.subtitle, { fontSize: 11, color: "#7c3aed" }]}>
                    {artistsText}
                    {event.artists.length > 3 && ` +${event.artists.length - 3} more`}
                  </Text>
                )}
                {event.interestedCount !== null && event.interestedCount > 0 && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: "#999" }]}>
                    {event.interestedCount} interested
                  </Text>
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
                height: 55,
                width: 55,
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
});

