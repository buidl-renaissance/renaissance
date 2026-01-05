import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { theme } from "../colors";
import { getSharedEvents, SharedEvent } from "../utils/sharedEvents";
import { EventCard } from "../Components/EventCard";
import { DAEvent } from "../interfaces";
import Icon, { IconTypes } from "../Components/Icon";

interface SharedEventsScreenProps {
  navigation: any;
  route: {
    params: {
      connection: any;
      otherUser: {
        userId: string;
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

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [sharedEvents, setSharedEvents] = useState<SharedEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSharedEvents = async () => {
    setLoading(true);
    try {
      const events = await getSharedEvents();
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

  const handleEventPress = (event: SharedEvent) => {
    if (event.eventType === "da") {
      navigation.navigate("Event", { event: event.event as DAEvent });
    } else {
      // For other event types, you might want to open in a web view or handle differently
      navigation.navigate("Event", { event: event.event });
    }
  };

  const renderEvent = (sharedEvent: SharedEvent, index: number) => {
    if (sharedEvent.eventType === "da") {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleEventPress(sharedEvent)}
        >
          <EventCard
            event={sharedEvent.event as DAEvent}
            options={{ showBookmark: true, showDate: true, showImage: true }}
          />
        </TouchableOpacity>
      );
    }

    // For non-DA events, render a simple card
    const event = sharedEvent.event;
    const title =
      "title" in event
        ? event.title
        : "name" in event
        ? event.name
        : "Unknown Event";

    return (
      <TouchableOpacity
        key={index}
        style={styles.eventCard}
        onPress={() => handleEventPress(sharedEvent)}
      >
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{title}</Text>
          <Text style={styles.eventType}>{sharedEvent.eventType.toUpperCase()}</Text>
        </View>
        <Icon
          type={IconTypes.Ionicons}
          name="chevron-forward"
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {otherUser.pfpUrl ? (
            <Image source={{ uri: otherUser.pfpUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon
                type={IconTypes.Ionicons}
                name="person"
                size={24}
                color={theme.textSecondary}
              />
            </View>
          )}
          <View style={styles.userText}>
            <Text style={styles.userName}>
              {otherUser.displayName || otherUser.username || "Unknown User"}
            </Text>
            {otherUser.username && (
              <Text style={styles.userUsername}>@{otherUser.username}</Text>
            )}
          </View>
        </View>
        <Text style={styles.subtitle}>
          Events you both have bookmarked or marked as going
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading shared events...</Text>
        </View>
      ) : sharedEvents.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sharedEvents.map((event, index) => renderEvent(event, index))}
        </ScrollView>
      )}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: theme.textTertiary,
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
