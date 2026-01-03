import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { EventCard } from "./EventCard";
import { LumaEventCard } from "./LumaEventCard";
import { RAEventCard } from "./RAEventCard";
import { EventWebModal } from "./EventWebModal";
import { SectionHeader } from "./SectionHeader";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { DAEvent, LumaEvent, RAEvent } from "../interfaces";
import { getBookmarkedEvents } from "../utils/bookmarks";
import moment from "moment";
import { EventRegister } from "react-native-event-listeners";
import { theme } from "../colors";

interface BookmarksModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Array<{ event: DAEvent | LumaEvent | RAEvent; eventType: 'da' | 'luma' | 'ra' }>>([]);
  const [eventsGroup, setEventsGroup] = useState<
    { data: (DAEvent | LumaEvent | RAEvent)[]; title: string; subtitle: string; sortDate?: number; dateKey?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const sectionListRef = useRef<SectionList>(null);

  // State for web modal
  const [webModalVisible, setWebModalVisible] = useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = useState<string | null>(null);
  const [webModalTitle, setWebModalTitle] = useState<string>("");
  const [webModalEventType, setWebModalEventType] = useState<'ra' | 'luma' | 'da' | undefined>(undefined);
  const [webModalEventData, setWebModalEventData] = useState<any>(null);

  const handlePressDAEvent = useCallback((event: DAEvent) => {
    // Navigate to event - for now just close modal, can be enhanced later
    onClose();
  }, [onClose]);

  const handlePressLumaEvent = useCallback((event: LumaEvent) => {
    setWebModalUrl(`https://lu.ma/${event.url}`);
    setWebModalTitle(event.name);
    setWebModalEventType('luma');
    setWebModalEventData(event);
    setWebModalVisible(true);
  }, []);

  const handlePressRAEvent = useCallback((event: RAEvent) => {
    setWebModalUrl(`https://ra.co${event.contentUrl}`);
    setWebModalTitle(event.title);
    setWebModalEventType('ra');
    setWebModalEventData(event);
    setWebModalVisible(true);
  }, []);

  const handleCloseWebModal = useCallback(() => {
    setWebModalVisible(false);
    setWebModalUrl(null);
    setWebModalTitle("");
    setWebModalEventType(undefined);
    setWebModalEventData(null);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const loadBookmarks = async () => {
        setIsLoading(true);
        try {
          const bookmarks = await getBookmarkedEvents();
          setBookmarkedEvents(bookmarks);
        } catch (error) {
          console.error("Error loading bookmarks:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadBookmarks();
    }
  }, [isVisible]);

  // Listen for bookmark changes
  useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", () => {
      if (isVisible) {
        const loadBookmarks = async () => {
          setIsLoading(true);
          try {
            const bookmarks = await getBookmarkedEvents();
            setBookmarkedEvents(bookmarks);
          } catch (error) {
            console.error("Error loading bookmarks:", error);
          } finally {
            setIsLoading(false);
          }
        };
        loadBookmarks();
      }
    });
    
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [isVisible]);

  // Group bookmarked events by date
  useEffect(() => {
    const groups: any = {};
    
    bookmarkedEvents.forEach((item) => {
      const { event, eventType } = item;
      let start, end;
      
      // Get start and end dates based on event type
      if (eventType === 'da') {
        const daEvent = event as DAEvent;
        start = moment(daEvent.start_date);
        end = moment(daEvent.end_date);
      } else if (eventType === 'luma') {
        const lumaEvent = event as LumaEvent;
        start = moment(lumaEvent.startAt);
        end = moment(lumaEvent.endAt);
      } else if (eventType === 'ra') {
        const raEvent = event as RAEvent;
        start = moment(raEvent.startTime);
        end = moment(raEvent.endTime);
      } else {
        return; // Skip unknown event types
      }
      
      // Only include events that haven't ended
      if (end.isAfter()) {
        const dateKey = start.format("YYYY-MM-DD");
        const date = start.format("MMMM Do");
        const subtitle = start.format("dddd");
        
        if (!groups[dateKey]) {
          groups[dateKey] = {
            title: date,
            subtitle: subtitle,
            data: [],
            sortDate: start.valueOf(),
            dateKey: dateKey,
          };
        }
        
        // Add event with eventType for rendering
        groups[dateKey].data.push({ ...event, eventType });
      }
    });

    // Sort events within each group by start time
    Object.values(groups).forEach((group: any) => {
      group.data.sort((a, b) => {
        let aStart, bStart;
        
        // Get start time for event a
        if (a.eventType === "luma") {
          aStart = moment(a.startAt);
        } else if (a.eventType === "ra") {
          aStart = moment(a.startTime);
        } else {
          aStart = moment(a.start_date);
        }
        
        // Get start time for event b
        if (b.eventType === "luma") {
          bStart = moment(b.startAt);
        } else if (b.eventType === "ra") {
          bStart = moment(b.startTime);
        } else {
          bStart = moment(b.start_date);
        }
        
        // Validate both dates are valid
        if (!aStart.isValid()) {
          return 1;
        }
        if (!bStart.isValid()) {
          return -1;
        }
        
        return aStart.diff(bStart);
      });
    });

    // Sort groups by date chronologically
    const groupsArray = Object.values(groups) as any;
    groupsArray.sort((a: any, b: any) => a.sortDate - b.sortDate);
    
    setEventsGroup(groupsArray);
  }, [bookmarkedEvents]);

  return (
    <>
      <DismissibleScrollModal
        isVisible={isVisible}
        onClose={onClose}
        title="Bookmarked Events"
        backgroundColor={theme.background}
      >
        {({ onScroll, scrollEnabled }) => (
          <SectionList
            ref={sectionListRef}
            sections={eventsGroup}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            bounces={true}
            scrollEnabled={scrollEnabled}
            nestedScrollEnabled={true}
            renderSectionHeader={({ section: { title, subtitle } }) => (
              <SectionHeader title={title} subtitle={subtitle} />
            )}
            renderItem={({ item }) => {
              const eventType = (item as any).eventType;
              
              if (eventType === 'da') {
                const daEvent = item as DAEvent;
                return (
                  <View style={{ paddingHorizontal: 16 }}>
                    <EventCard
                      event={daEvent}
                      options={{
                        showDate: false,
                        showBookmark: false,
                        showVenue: true,
                        showImage: true,
                      }}
                      onSelectEvent={() => handlePressDAEvent(daEvent)}
                    />
                  </View>
                );
              } else if (eventType === 'luma') {
                const lumaEvent = item as LumaEvent;
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
                const raEvent = item as RAEvent;
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
              const eventType = (item as any).eventType;
              if (eventType === 'da') {
                return `da-${(item as DAEvent).id}`;
              } else if (eventType === 'luma') {
                return `luma-${(item as LumaEvent).apiId}`;
              } else if (eventType === 'ra') {
                return `ra-${(item as RAEvent).id}`;
              }
              return `event-${index}`;
            }}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366F1" />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyTextContainer}>
                    <Text style={styles.emptyText}>No bookmarked events</Text>
                  </View>
                </View>
              )
            }
          />
        )}
      </DismissibleScrollModal>
      
      <EventWebModal
        isVisible={webModalVisible}
        url={webModalUrl}
        title={webModalTitle}
        onClose={handleCloseWebModal}
        eventType={webModalEventType}
        eventData={webModalEventData}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTextContainer: {
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

