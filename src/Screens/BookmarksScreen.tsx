import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";

import { EventsSectionList } from "../Components/EventsSectionList";
import { EventWebModal } from "../Components/EventWebModal";
import { InstagramPostModal } from "../Components/InstagramPostModal";

import { DAEvent, LumaEvent, RAEvent, MeetupEvent, InstagramEvent } from "../interfaces";
import { SportsGame } from "../api/sports-games";
import { getBookmarkedEvents } from "../utils/bookmarks";
import { groupEventsByDate, TypedEvent } from "../utils/eventGrouping";
import { useWebModal } from "../hooks/useWebModal";

const BookmarksScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: "Bookmarked Events",
  });

  const [bookmarkedEvents, setBookmarkedEvents] = React.useState<TypedEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [instagramModalVisible, setInstagramModalVisible] = React.useState<boolean>(false);
  const [instagramModalEvent, setInstagramModalEvent] = React.useState<InstagramEvent | null>(null);
  
  const webModal = useWebModal();

  const handlePressDAEvent = React.useCallback((event: DAEvent) => {
    navigation.push("Event", {
      event,
    });
  }, [navigation]);

  const handlePressLumaEvent = React.useCallback((event: LumaEvent) => {
    webModal.openWebModal(`https://lu.ma/${event.url}`, event.name, 'luma', event);
  }, [webModal]);

  const handlePressRAEvent = React.useCallback((event: RAEvent) => {
    webModal.openWebModal(`https://ra.co${event.contentUrl}`, event.title, 'ra', event);
  }, [webModal]);

  const handlePressMeetupEvent = React.useCallback((event: MeetupEvent) => {
    webModal.openWebModal(event.eventUrl, event.title, 'meetup', event);
  }, [webModal]);

  const handlePressSportsEvent = React.useCallback((game: SportsGame) => {
    if (game.link) {
      webModal.openWebModal(
        game.link,
        `${game.awayTeam.shortDisplayName} @ ${game.homeTeam.shortDisplayName}`,
        'sports',
        game
      );
    }
  }, [webModal]);

  const handlePressInstagramEvent = React.useCallback((event: InstagramEvent) => {
    setInstagramModalEvent(event);
    setInstagramModalVisible(true);
  }, []);

  const handleCloseInstagramModal = React.useCallback(() => {
    setInstagramModalVisible(false);
    setInstagramModalEvent(null);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    
    const loadBookmarks = async (useCache: boolean = true, showRefreshing: boolean = false) => {
      try {
        if (showRefreshing) {
          if (mounted) setIsRefreshing(true);
        } else {
          // Always show loading on initial load
          if (mounted) setIsLoading(true);
        }

        // Try to load from cache first for instant display
        const bookmarks = await getBookmarkedEvents(useCache);
        
        if (mounted) {
          setBookmarkedEvents(bookmarks);
          // Don't set loading to false here - let it be set after grouping
        }

        // If we used cache, refresh in background without showing loading
        if (useCache && !showRefreshing) {
          // Load fresh data in background
          getBookmarkedEvents(false).then((freshBookmarks) => {
            if (mounted) {
              setBookmarkedEvents(freshBookmarks);
            }
          }).catch((error) => {
            console.error("Error refreshing bookmarks:", error);
          });
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
        if (mounted) setIsLoading(false);
      } finally {
        if (mounted) setIsRefreshing(false);
      }
    };
    
    // Initial load with cache
    loadBookmarks(true, false);
    
    // Refresh when screen comes into focus (use cache for instant display)
    const unsubscribe = navigation.addListener('focus', () => {
      if (mounted) {
        loadBookmarks(true, false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [navigation]);

  // Group bookmarked events by date
  React.useEffect(() => {
    const grouped = groupEventsByDate(bookmarkedEvents, {
      filterEnded: true, // Only include events that haven't ended
    });
    setEventsGroup(grouped);
    
    // Once we've grouped events, stop loading (even if grouped is empty - that means no events)
    if (isLoading) {
      setIsLoading(false);
    }
  }, [bookmarkedEvents, isLoading]);

  // Show loading indicator on initial load (when we have no events yet)
  if (isLoading && bookmarkedEvents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRefreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color="#7c3aed" />
          <Text style={styles.refreshingText}>Refreshing...</Text>
        </View>
      )}
      <EventsSectionList
        eventsGroup={eventsGroup}
        eventRendererProps={{
          containerStyle: { paddingHorizontal: 16 },
          onSelectDAEvent: handlePressDAEvent,
          onSelectLumaEvent: handlePressLumaEvent,
          onSelectRAEvent: handlePressRAEvent,
          onSelectMeetupEvent: handlePressMeetupEvent,
          onSelectSportsEvent: handlePressSportsEvent,
          onSelectInstagramEvent: handlePressInstagramEvent,
          showFeaturedImage: false, // Match SearchScreen
          eventCardOptions: {
            showVenue: true,
            showImage: true,
            showBookmark: false, // Don't show bookmark button in bookmarks screen
          },
        }}
        emptyText="No bookmarked events"
        contentContainerStyle={{ paddingBottom: 16 }}
      />
      <EventWebModal
        isVisible={webModal.webModalVisible}
        url={webModal.webModalUrl}
        title={webModal.webModalTitle}
        onClose={webModal.closeWebModal}
        eventType={webModal.webModalEventType}
        eventData={webModal.webModalEventData}
      />
      <InstagramPostModal
        isVisible={instagramModalVisible}
        event={instagramModalEvent}
        onClose={() => {
          setInstagramModalVisible(false);
          setInstagramModalEvent(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
});

export default BookmarksScreen;
