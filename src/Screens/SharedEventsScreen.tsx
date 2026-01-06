import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  RefreshControl,
  FlatList,
} from "react-native";
import { theme } from "../colors";
import { getSharedEvents, SharedEvent } from "../utils/sharedEvents";
import { EventRenderer } from "../Components/EventRenderer";
import { EventWebModal } from "../Components/EventWebModal";
import { useWebModal } from "../hooks/useWebModal";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";
import Icon, { IconTypes } from "../Components/Icon";
import { getUserProfileImageUrl } from "../api/user";

interface SharedEventsScreenProps {
  navigation: any;
  route: {
    params: {
      connection: any;
      otherUser: {
        userId: string;
        backendUserId?: number; // Backend user ID for fetching bookmarks
        username?: string;
        displayName?: string;
        pfpUrl?: string;
      };
    };
  };
}

const SharedEventsScreen: React.FC<SharedEventsScreenProps> = ({
  navigation,
  route,
}) => {
  const { connection, otherUser } = route.params;
  const webModal = useWebModal();

  navigation.setOptions({
    headerTitle: otherUser.username ? `@${otherUser.username}` : otherUser.displayName || "User",
  });

  const [sharedEvents, setSharedEvents] = useState<SharedEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSharedEvents = async () => {
    setLoading(true);
    try {
      // Pass the other user's backend ID to fetch their bookmarks from the API
      const events = await getSharedEvents(otherUser.backendUserId);
      setSharedEvents(events);
    } catch (error) {
      console.error("Error loading shared events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSharedEvents();
    setRefreshing(false);
  };

  // Event handlers matching CalendarScreen
  const handleSelectDAEvent = useCallback(
    (event: DAEvent) => {
      navigation.navigate("Event", { event });
    },
    [navigation]
  );

  const handleSelectLumaEvent = useCallback(
    (event: LumaEvent) => {
      webModal.openWebModal(`https://lu.ma/${event.url}`, event.name, "luma", event);
    },
    [webModal]
  );

  const handleSelectRAEvent = useCallback(
    (event: RAEvent) => {
      webModal.openWebModal(`https://ra.co${event.contentUrl}`, event.title, "ra", event);
    },
    [webModal]
  );

  const handleSelectMeetupEvent = useCallback(
    (event: MeetupEvent) => {
      webModal.openWebModal(event.eventUrl, event.title, "meetup", event);
    },
    [webModal]
  );

  const handleSelectSportsEvent = useCallback(
    (game: SportsGame) => {
      if (game.link) {
        webModal.openWebModal(
          game.link,
          `${game.awayTeam.shortDisplayName} @ ${game.homeTeam.shortDisplayName}`,
          "sports",
          game
        );
      }
    },
    [webModal]
  );

  const handleSelectInstagramEvent = useCallback(
    (event: InstagramEvent) => {
      // For Instagram events, navigate to a detail screen or open in web modal
      navigation.navigate("Event", { event, eventType: "instagram" });
    },
    [navigation]
  );

  const renderEvent = useCallback(
    ({ item }: { item: SharedEvent }) => {
      // Add eventType to the event object for EventRenderer
      const eventWithType = { ...item.event, eventType: item.eventType };
      return (
        <EventRenderer
          item={eventWithType}
          onSelectDAEvent={handleSelectDAEvent}
          onSelectLumaEvent={handleSelectLumaEvent}
          onSelectRAEvent={handleSelectRAEvent}
          onSelectMeetupEvent={handleSelectMeetupEvent}
          onSelectSportsEvent={handleSelectSportsEvent}
          onSelectInstagramEvent={handleSelectInstagramEvent}
          containerStyle={styles.eventContainer}
          eventCardOptions={{
            showVenue: true,
            showImage: true,
            showBookmark: true,
          }}
        />
      );
    },
    [
      handleSelectDAEvent,
      handleSelectLumaEvent,
      handleSelectRAEvent,
      handleSelectMeetupEvent,
      handleSelectSportsEvent,
      handleSelectInstagramEvent,
    ]
  );

  const keyExtractor = useCallback(
    (item: SharedEvent, index: number) => `${item.eventType}-${index}`,
    []
  );

  const ListHeader = () => {
    const imageUrl = otherUser.username
      ? getUserProfileImageUrl(otherUser.username)
      : otherUser.pfpUrl;

    const sharedCount = sharedEvents.length;

    return (
      <View style={styles.header}>
        {/* Instagram-style profile header */}
        <View style={styles.profileRow}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon
                  type={IconTypes.Ionicons}
                  name="person"
                  size={40}
                  color={theme.textSecondary}
                />
              </View>
            )}
          </View>

          {/* Name and Button - Instagram style */}
          <View style={styles.infoContainer}>
            {/* Display name */}
            <Text style={styles.userName}>
              {otherUser.displayName || otherUser.username || "Unknown User"}
            </Text>

            {/* Connection button */}
            <View style={styles.connectionButton}>
              <Icon
                type={IconTypes.Ionicons}
                name="checkmark-circle"
                size={14}
                color="#fff"
              />
              <Text style={styles.connectionButtonText}>Connected</Text>
            </View>
          </View>
        </View>

        {/* Section divider with bookmark and count */}
        <View style={styles.sectionDivider}>
          <View style={styles.sectionTab}>
            <Icon
              type={IconTypes.Ionicons}
              name="bookmark"
              size={22}
              color={theme.text}
            />
            <Text style={styles.sectionCount}>{sharedCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon
        type={IconTypes.Ionicons}
        name="calendar-outline"
        size={64}
        color={theme.textTertiary}
      />
      <Text style={styles.emptyTitle}>No Shared Events</Text>
      <Text style={styles.emptyText}>
        You don't have any events in common yet
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ListHeader />
          <Text style={styles.loadingText}>Loading shared events...</Text>
        </View>
      ) : (
        <FlatList
          data={sharedEvents}
          renderItem={renderEvent}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Web Modal for non-DA events */}
      <EventWebModal
        isVisible={webModal.webModalVisible}
        url={webModal.webModalUrl}
        title={webModal.webModalTitle}
        onClose={webModal.closeWebModal}
        eventType={webModal.webModalEventType}
        eventData={webModal.webModalEventData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.surface,
    paddingTop: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 0,
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 12,
  },
  connectionButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#22C55E",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  connectionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    flexDirection: "row",
    justifyContent: "center",
  },
  sectionTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.text,
    marginTop: -1,
    gap: 6,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
  },
  listContent: {
    paddingBottom: 16,
  },
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 32,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },
});

export default SharedEventsScreen;
