import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import { formatDay, formatMonth } from "../utils/formatDate";
import { SportsGame } from "../api/sports-games";
import Icon, { IconTypes } from "./Icon";
import { getBookmarkStatusForWebEvent, toggleBookmarkForWebEvent } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";
import * as Linking from "expo-linking";
import { theme } from "../colors";

export interface SportsGameCardOptions {
  showDate?: boolean;
  showImage?: boolean;
  showVenue?: boolean;
}

const formatTime = (date: string) => {
  return moment(date).format("h:mm a");
};

const getSportEmoji = (sport: string | undefined) => {
  if (!sport || typeof sport !== 'string') {
    return "🏟️";
  }
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

const getSportColor = (sport: string | undefined) => {
  if (!sport || typeof sport !== 'string') {
    return "#666";
  }
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
  initialBookmarkStatus?: boolean;
}

export const SportsGameCard: React.FC<SportsGameCardProps> = ({
  children,
  game,
  options = { showVenue: true, showImage: true },
  onSelectEvent,
  initialBookmarkStatus,
}) => {
  const [isNow, setIsNow] = React.useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(initialBookmarkStatus ?? false);

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

  // Load bookmark status (skip if initialBookmarkStatus was provided)
  React.useEffect(() => {
    if (initialBookmarkStatus !== undefined) return;
    (async () => {
      const bookmarked = await getBookmarkStatusForWebEvent(game, 'sports');
      setIsBookmarked(bookmarked);
    })();
  }, [game, initialBookmarkStatus]);

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
                    color: theme.textSecondary,
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
                    color: theme.text,
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
                        color: theme.textOnPrimary,
                        fontWeight: "600",
                      }}
                    >
                      {sportEmoji} {game.sport?.toUpperCase() || 'SPORT'}
                    </Text>
                  </View>
                  {isHomeGame && (
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
                          color: theme.textOnPrimary,
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
                        backgroundColor: theme.warning,
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
                  {matchText}
                </Text>
                {game.venue && options?.showVenue && (
                  <Text style={styles.subtitle}>
                    {game.venue} • {game.venueCity}, {game.venueState}
                  </Text>
                )}
                {game.broadcasts && game.broadcasts.length > 0 && (
                  <Text style={[styles.subtitle, { fontSize: 10, color: theme.textSecondary, marginTop: 2 }]}>
                    {game.broadcasts.map(b => b.shortName || b.name).filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {options.showImage && game.homeTeam.logo && (
          <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 8, justifyContent: "center" }} onPress={handlePress}>
            <View style={{ alignItems: "center", minWidth: 80, justifyContent: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <View style={{ alignItems: "center" }}>
                  <Image
                    source={{
                      uri: game.awayTeam.logo,
                    }}
                    style={{
                      height: 36,
                      width: 36,
                      resizeMode: "contain",
                    }}
                  />
                  {(game.homeScore !== null || game.awayScore !== null) && (
                    <Text style={[styles.subtitle, { fontSize: 13, fontWeight: "700", marginTop: 2 }]}>
                      {game.awayScore ?? 0}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: -8 }}>@</Text>
                <View style={{ alignItems: "center" }}>
                  <Image
                    source={{
                      uri: game.homeTeam.logo,
                    }}
                    style={{
                      height: 36,
                      width: 36,
                      resizeMode: "contain",
                    }}
                  />
                  {(game.homeScore !== null || game.awayScore !== null) && (
                    <Text style={[styles.subtitle, { fontSize: 13, fontWeight: "700", marginTop: 2 }]}>
                      {game.homeScore ?? 0}
                    </Text>
                  )}
                </View>
              </View>
              {(game.period !== null || game.periodType || game.displayClock) && (
                <Text style={[styles.subtitle, { fontSize: 9, color: theme.textSecondary, marginTop: 4 }]}>
                  {(() => {
                    let periodText = '';
                    if (game.periodType && game.period !== null) {
                      periodText = `${game.periodType} ${game.period}`;
                    } else if (game.period !== null) {
                      periodText = `Period ${game.period}`;
                    }
                    if (game.displayClock && periodText) {
                      return `${periodText} • ${game.displayClock}`;
                    } else if (game.displayClock) {
                      return game.displayClock;
                    }
                    return periodText;
                  })()}
                </Text>
              )}
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

