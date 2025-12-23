import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
} from "react-native";

import { EventCard } from "../Components/EventCard";
import { LumaEventCard } from "../Components/LumaEventCard";
import { RAEventCard } from "../Components/RAEventCard";
import { EventWebModal } from "../Components/EventWebModal";

import { DAEvent, LumaEvent, RAEvent } from "../interfaces";
import { getBookmarkedEvents } from "../utils/bookmarks";

const BookmarksScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: "Bookmarked Events",
  });

  const [bookmarkedEvents, setBookmarkedEvents] = React.useState<Array<{ event: DAEvent | LumaEvent | RAEvent; eventType: 'da' | 'luma' | 'ra' }>>([]);

  // State for web modal
  const [webModalVisible, setWebModalVisible] = React.useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = React.useState<string | null>(null);
  const [webModalTitle, setWebModalTitle] = React.useState<string>("");
  const [webModalEventType, setWebModalEventType] = React.useState<'ra' | 'luma' | 'da' | undefined>(undefined);
  const [webModalEventData, setWebModalEventData] = React.useState<any>(null);

  const handlePressDAEvent = React.useCallback((event: DAEvent) => {
    navigation.push("Event", {
      event,
    });
  }, [navigation]);

  const handlePressLumaEvent = React.useCallback((event: LumaEvent) => {
    setWebModalUrl(`https://lu.ma/${event.url}`);
    setWebModalTitle(event.name);
    setWebModalEventType('luma');
    setWebModalEventData(event);
    setWebModalVisible(true);
  }, []);

  const handlePressRAEvent = React.useCallback((event: RAEvent) => {
    setWebModalUrl(`https://ra.co${event.contentUrl}`);
    setWebModalTitle(event.title);
    setWebModalEventType('ra');
    setWebModalEventData(event);
    setWebModalVisible(true);
  }, []);

  const handleCloseWebModal = React.useCallback(() => {
    setWebModalVisible(false);
    setWebModalUrl(null);
    setWebModalTitle("");
    setWebModalEventType(undefined);
    setWebModalEventData(null);
  }, []);

  React.useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarks = await getBookmarkedEvents();
      setBookmarkedEvents(bookmarks);
    };
    
    loadBookmarks();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadBookmarks();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarkedEvents}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const { event, eventType } = item;
          
          if (eventType === 'da') {
            const daEvent = event as DAEvent;
            return (
              <View>
                <TouchableOpacity onPress={() => handlePressDAEvent(daEvent)}>
                  <View style={{ paddingHorizontal: 4 }}>
                    <EventCard
                      event={daEvent}
                      options={{
                        showDate: true,
                        showBookmark: true,
                        showVenue: true,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          } else if (eventType === 'luma') {
            const lumaEvent = event as LumaEvent;
            return (
              <View style={{ paddingHorizontal: 16 }}>
                <LumaEventCard
                  event={lumaEvent}
                  options={{
                    showLocation: true,
                    showImage: true,
                    showHosts: true,
                  }}
                  onSelectEvent={() => handlePressLumaEvent(lumaEvent)}
                />
              </View>
            );
          } else if (eventType === 'ra') {
            const raEvent = event as RAEvent;
            return (
              <View style={{ paddingHorizontal: 16 }}>
                <RAEventCard
                  event={raEvent}
                  options={{
                    showVenue: true,
                    showImage: true,
                    showArtists: true,
                  }}
                  onSelectEvent={() => handlePressRAEvent(raEvent)}
                />
              </View>
            );
          }
          
          return null;
        }}
        keyExtractor={(item, index) => {
          if (item.eventType === 'da') {
            return `da-${(item.event as DAEvent).id}`;
          } else if (item.eventType === 'luma') {
            return `luma-${(item.event as LumaEvent).apiId}`;
          } else if (item.eventType === 'ra') {
            return `ra-${(item.event as RAEvent).id}`;
          }
          return `event-${index}`;
        }}
      />
      <EventWebModal
        isVisible={webModalVisible}
        url={webModalUrl}
        title={webModalTitle}
        onClose={handleCloseWebModal}
        eventType={webModalEventType}
        eventData={webModalEventData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default BookmarksScreen;
