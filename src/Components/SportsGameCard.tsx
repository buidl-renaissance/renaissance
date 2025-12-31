import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { SportsGame } from "../api/sports-games";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import * as Linking from "expo-linking";

export interface SportsGameCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showVenue?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const getSportEmoji = (sport: string) => {
  switch (sport.toLowerCase()) {
    case "nhl":
      return "🏒";
    case "nba":
      return "🏀";
    case "nfl":
      return "🏈";
    case "mlb":
      return "⚾";
    default:
      return "🏟️";
  }
};

const getSportColor = (sport: string) => {
  switch (sport.toLowerCase()) {
    case "nhl":
      return "#C8102E"; // Red
    case "nba":
      return "#C8102E"; // Red
    case "nfl":
      return "#0076B6"; // Blue
    case "mlb":
      return "#0C2340"; // Dark Blue
    default:
      return "#666";
  }
};

interface SportsGameCardProps {
  children?: any;
  game: SportsGame;
  options?: SportsGameCardOptions;
  onSelectEvent?: () => void;
}

export const SportsGameCard: React.FC<SportsGameCardProps> = ({
  children,
  game,
  options = { showVenue: true, showImage: true },
  onSelectEvent,
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);

  React.useEffect(() => {
    const start = moment(game.startTime);
    // Assume games last 3 hours
    const end = moment(game.startTime).add(3, "hours");
    if (start.isBefore() && end.isAfter()) {
      setIsNow(true);
    } else {
      setIsNow(false);
    }
  }, [game.startTime]);

  // Load bookmark status
  React.useEffect(() => {
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(game, 'sports');
      setIsBookmarked(bookmarked);
    })();
  }, [game]);

  // Listen for bookmark changes
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (game.id === data.event?.id || (data.event?.eventType === 'sports' && data.event?.id === game.id)) {
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [game]);

  const handleBookmarkBadgePress = React.useCallback(async (e: any) => {
    e.stopPropagation();
    const newBookmarkStatus = await toggleBookmarkForWebEvent(game, 'sports');
    setIsBookmarked(newBookmarkStatus);
    EventRegister.emitEvent("BookmarkEvent", {
      event: { ...game, eventType: 'sports' },
      isBookmarked: newBookmarkStatus,
    });
  }, [game]);

  const handlePress = React.useCallback(() => {
    if (onSelectEvent) {
      onSelectEvent();
    } else if (game.link) {
      Linking.openURL(game.link);
    }
  }, [onSelectEvent, game.link]);

  const sportEmoji = getSportEmoji(game.sport);
  const sportColor = getSportColor(game.sport);
  const isHomeGame = game.venueCity === "Detroit" && game.venueState === "MI";
  const isAwayGame = !isHomeGame;
  const matchText = `${game.awayTeam.shortDisplayName} @ ${game.homeTeam.shortDisplayName}`;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={{
            paddingVertical: 6,
            flex: 1,
            flexDirection: "row",
            borderColor: sportColor,
            borderLeftWidth: 3,
            paddingLeft: 6,
            marginLeft: -8,
            paddingRight: 8,
          }}
          onPress={handlePress}
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
                  {formatMonth(game.startTime)}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontWeight: "bold",
                    fontSize: 22,
                    textAlign: "center",
                  }}
                >
                  {formatDay(game.startTime)}
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
                    {formatTime(game.startTime)}
                  </Text>
                  <View
                    style={{
                      backgroundColor: sportColor,
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
                      {sportEmoji} {game.sport.toUpperCase()}
                    </Text>
                  </View>
                  {isHomeGame && (
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
                        HOME
                      </Text>
                    </View>
                  )}
                  {isAwayGame && (
                    <View
                      style={{
                        backgroundColor: "#f59e0b",
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
                        AWAY
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
                        color="#3449ff"
                        name="bookmark"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  style={[styles.title, { fontSize: 18 }]}
                  numberOfLines={2}
                >
                  {matchText}
                </Text>
                {game.venue && options?.showVenue && (
                  <Text style={styles.subtitle}>
                    {game.venue} • {game.venueCity}, {game.venueState}
                  </Text>
                )}
                {game.statusDetail && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: "#999" }]}>
                    {game.statusDetail}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {options.showImage && game.homeTeam.logo && (
          <TouchableOpacity style={{ padding: 8 }} onPress={handlePress}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Image
                source={{
                  uri: game.awayTeam.logo,
                }}
                style={{
                  height: 30,
                  width: 30,
                  resizeMode: "contain",
                }}
              />
              <Text style={{ fontSize: 12, color: "#999" }}>@</Text>
              <Image
                source={{
                  uri: game.homeTeam.logo,
                }}
                style={{
                  height: 30,
                  width: 30,
                  resizeMode: "contain",
                }}
              />
            </View>
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
  bookmarkBadge: {
    marginLeft: 6,
    padding: 2,
  },
});

