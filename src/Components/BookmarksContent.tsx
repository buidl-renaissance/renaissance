import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

import { EventsSectionList } from "./EventsSectionList";
import { EventWebModal } from "./EventWebModal";
import { InstagramPostModal } from "./InstagramPostModal";

import { DAEvent, LumaEvent, RAEvent, MeetupEvent, InstagramEvent } from "../interfaces";
import { SportsGame } from "../api/sports-games";
import { getBookmarkedEvents } from "../utils/bookmarks";
import { groupEventsByDate, TypedEvent } from "../utils/eventGrouping";
import { useWebModal } from "../hooks/useWebModal";
import { theme } from "../colors";

export interface BookmarksContentProps {
  /** Navigation object for pushing screens */
  navigation?: any;
  /** Whether the content is currently visible (controls data loading) */
  isVisible?: boolean;
  /** Optional scroll handler for modal dismiss integration */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Whether scrolling is enabled (for modal integration) */
  scrollEnabled?: boolean;
  /** Style for the container */
  containerStyle?: object;
  /** Style for the list content */
  contentContainerStyle?: object;
  /** Whether to show bookmark buttons on event cards */
  showBookmarkButton?: boolean;
}

export const BookmarksContent: React.FC<BookmarksContentProps> = ({
  navigation,
  isVisible = true,
  onScroll,
  scrollEnabled = true,
  containerStyle,
  contentContainerStyle,
  showBookmarkButton = false,
}) => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<TypedEvent[]>([]);
  const [eventsGroup, setEventsGroup] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [instagramModalVisible, setInstagramModalVisible] = useState<boolean>(false);
  const [instagramModalEvent, setInstagramModalEvent] = useState<InstagramEvent | null>(null);
  
  const webModal = useWebModal();

  const handlePressDAEvent = useCallback((event: DAEvent) => {
    if (navigation) {
      navigation.push("Event", { event });
    }
  }, [navigation]);

  const handlePressLumaEvent = useCallback((event: LumaEvent) => {
    webModal.openWebModal(`https://lu.ma/${event.url}`, event.name, 'luma', event);
  }, [webModal]);

  const handlePressRAEvent = useCallback((event: RAEvent) => {
    webModal.openWebModal(`https://ra.co${event.contentUrl}`, event.title, 'ra', event);
  }, [webModal]);

  const handlePressMeetupEvent = useCallback((event: MeetupEvent) => {
    webModal.openWebModal(event.eventUrl, event.title, 'meetup', event);
  }, [webModal]);

  const handlePressSportsEvent = useCallback((game: SportsGame) => {
    if (game.link) {
      webModal.openWebModal(
        game.link,
        `${game.awayTeam.shortDisplayName} @ ${game.homeTeam.shortDisplayName}`,
        'sports',
        game
      );
    }
  }, [webModal]);

  const handlePressInstagramEvent = useCallback((event: InstagramEvent) => {
    setInstagramModalEvent(event);
    setInstagramModalVisible(true);
  }, []);

  const loadBookmarks = useCallback(async (useCache: boolean = true, showRefreshing: boolean = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const bookmarks = await getBookmarkedEvents(useCache);
      setBookmarkedEvents(bookmarks);

      // If we used cache, refresh in background
      if (useCache && !showRefreshing) {
        getBookmarkedEvents(false).then((freshBookmarks) => {
          setBookmarkedEvents(freshBookmarks);
        }).catch((error) => {
          console.error("Error refreshing bookmarks:", error);
        });
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      setIsLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      loadBookmarks(true, false);
    }
  }, [isVisible, loadBookmarks]);

  // Group bookmarked events by date
  useEffect(() => {
    const grouped = groupEventsByDate(bookmarkedEvents, {
      filterEnded: true,
    });
    setEventsGroup(grouped);
    
    if (isLoading) {
      setIsLoading(false);
    }
  }, [bookmarkedEvents, isLoading]);

  const handleRefresh = useCallback(() => {
    loadBookmarks(false, true);
  }, [loadBookmarks]);

  // Show loading indicator on initial load
  if (isLoading && bookmarkedEvents.length === 0) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {isRefreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color={theme.primary} />
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
          showFeaturedImage: false,
          eventCardOptions: {
            showVenue: true,
            showImage: true,
            showBookmark: showBookmarkButton,
          },
        }}
        emptyText="No bookmarked events"
        contentContainerStyle={contentContainerStyle}
        onScroll={onScroll}
        scrollEnabled={scrollEnabled}
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
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: theme.inputBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.textSecondary,
  },
});

export default BookmarksContent;
