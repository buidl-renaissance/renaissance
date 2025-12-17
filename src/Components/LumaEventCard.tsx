import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { LumaEvent } from "../interfaces";

export interface LumaEventCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showLocation?: boolean;
  showHosts?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const formatTimeRange = (event: LumaEvent) => {
  return `${formatTime(event.startAt)} - ${formatTime(event.endAt)}`;
};

interface LumaEventCardProps {
  children?: any;
  event: LumaEvent;
  options?: LumaEventCardOptions;
  onSelectEvent?: () => void;
}

export const LumaEventCard: React.FC<LumaEventCardProps> = ({
  children,
  event,
  options = { showLocation: true, showImage: true },
  onSelectEvent,
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(event.startAt);
    const end = moment(event.endAt);
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [event.startAt, event.endAt]);

  const hostsText = event.hosts
    ?.slice(0, 2)
    .map((host) => host.name)
    .join(", ");

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: "#ff6b6b",
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
                  {formatMonth(event.startAt)}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: "bold",
                    fontSize: 22,
                    textAlign: "center",
                  }}
                >
                  {formatDay(event.startAt)}
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
                          backgroundColor: "#ff6b6b",
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
                  {event.isFree && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: 8,
                          backgroundColor: "#4ecdc4",
                          color: "white",
                          borderRadius: 4,
                          paddingHorizontal: 3,
                          paddingVertical: 1,
                          marginLeft: 3,
                          overflow: "hidden",
                        },
                      ]}
                    >
                      FREE
                    </Text>
                  )}
                  <View
                    style={{
                      backgroundColor: "#ff6b6b",
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
                      LUMA
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.title, { fontSize: 18 }]}
                  numberOfLines={2}
                >
                  {event.name}
                </Text>
                {event.cityState && options?.showLocation && (
                  <Text style={styles.subtitle}>{event.cityState}</Text>
                )}
                {event.address && options?.showLocation && (
                  <Text style={[styles.subtitle, { fontSize: 10 }]}>
                    {event.address}
                  </Text>
                )}
                {hostsText && options?.showHosts && (
                  <Text style={styles.subtitle}>Hosted by: {hostsText}</Text>
                )}
                {event.guestCount > 0 && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: "#999" }]}>
                    {event.guestCount} {event.guestCount === 1 ? "guest" : "guests"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {options.showImage && event.coverUrl && (
          <TouchableOpacity style={{ padding: 8 }} onPress={onSelectEvent}>
            <Image
              source={{
                uri: event.coverUrl,
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

