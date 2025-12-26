import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { EventCard } from "./EventCard";
import { LumaEventCard } from "./LumaEventCard";
import { RAEventCard } from "./RAEventCard";
import { SectionHeader } from "./SectionHeader";
import { DAEvent, LumaEvent, RAEvent } from "../interfaces";
import moment from "moment";

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectEvent: (event: DAEvent | LumaEvent | RAEvent, eventType: 'da' | 'luma' | 'ra') => void;
  daEvents?: DAEvent[];
  lumaEvents?: LumaEvent[];
  raEvents?: RAEvent[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isVisible,
  onClose,
  onSelectEvent,
  daEvents = [],
  lumaEvents = [],
  raEvents = [],
}) => {
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: (DAEvent | LumaEvent | RAEvent)[]; title: string; subtitle: string; sortDate?: number; dateKey?: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchbarRef = React.useRef<any>(null);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Auto-focus search bar when modal opens
  React.useEffect(() => {
    if (isVisible && searchbarRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        searchbarRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  React.useEffect(() => {
    const query = searchQuery?.trim().toLowerCase() || "";
    const allEvents: Array<{ event: DAEvent | LumaEvent | RAEvent; eventType: 'da' | 'luma' | 'ra' }> = [];
    
    // Add DA events
    daEvents.forEach(event => {
      allEvents.push({ event, eventType: 'da' });
    });
    
    // Add Luma events
    lumaEvents.forEach(event => {
      allEvents.push({ event, eventType: 'luma' });
    });
    
    // Add RA events
    raEvents.forEach(event => {
      allEvents.push({ event, eventType: 'ra' });
    });
    
    // Filter events
    const filtered = allEvents.filter(({ event, eventType }) => {
      let endDate: moment.Moment | null = null;
      
      // Get end date based on event type
      if (eventType === 'da') {
        const daEvent = event as DAEvent;
        endDate = daEvent.end_date ? moment(daEvent.end_date) : null;
      } else if (eventType === 'luma') {
        const lumaEvent = event as LumaEvent;
        endDate = lumaEvent.endAt ? moment(lumaEvent.endAt) : null;
      } else if (eventType === 'ra') {
        const raEvent = event as RAEvent;
        endDate = raEvent.endTime ? moment(raEvent.endTime) : null;
      }
      
      // Filter out events that ended more than a week ago
      if (endDate && endDate.isBefore(moment().subtract(1, "week"))) {
        return false;
      }

      // If no search query, show all recent events
      if (!query) {
        return true;
      }

      // Search across title, description, venue/location names, and artists
      let titleMatch = false;
      let descriptionMatch = false;
      let locationMatch = false;
      let artistMatch = false;

      if (eventType === 'da') {
        const daEvent = event as DAEvent;
        titleMatch = daEvent.title?.toLowerCase().includes(query) || false;
        descriptionMatch = daEvent.description?.toLowerCase().includes(query) || false;
        locationMatch = 
          daEvent.venue?.title?.toLowerCase().includes(query) || 
          daEvent.venue?.venue?.toLowerCase().includes(query) || 
          daEvent.venue?.address?.toLowerCase().includes(query) || 
          false;
      } else if (eventType === 'luma') {
        const lumaEvent = event as LumaEvent;
        titleMatch = lumaEvent.name?.toLowerCase().includes(query) || false;
        locationMatch = 
          lumaEvent.addressDescription?.toLowerCase().includes(query) || 
          lumaEvent.fullAddress?.toLowerCase().includes(query) || 
          lumaEvent.address?.toLowerCase().includes(query) || 
          lumaEvent.cityState?.toLowerCase().includes(query) || 
          false;
      } else if (eventType === 'ra') {
        const raEvent = event as RAEvent;
        titleMatch = raEvent.title?.toLowerCase().includes(query) || false;
        locationMatch = raEvent.venue?.name?.toLowerCase().includes(query) || false;
        // Search through artists
        artistMatch = raEvent.artists?.some(artist => 
          artist.name?.toLowerCase().includes(query)
        ) || false;
      }

      return titleMatch || descriptionMatch || locationMatch || artistMatch;
    });

    // Group events by date
    const groups: any = {};
    
    filtered.forEach(({ event, eventType }) => {
      let start: moment.Moment;
      
      // Get start date based on event type
      if (eventType === 'da') {
        const daEvent = event as DAEvent;
        start = moment(daEvent.start_date);
      } else if (eventType === 'luma') {
        const lumaEvent = event as LumaEvent;
        start = moment(lumaEvent.startAt);
      } else {
        const raEvent = event as RAEvent;
        start = moment(raEvent.startTime);
      }
      
      if (!start.isValid()) {
        return; // Skip invalid dates
      }
      
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
    });

    // Sort events within each group by start time
    Object.values(groups).forEach((group: any) => {
      group.data.sort((a: any, b: any) => {
        let aStart: moment.Moment, bStart: moment.Moment;
        
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
  }, [daEvents, lumaEvents, raEvents, searchQuery]);

  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title="Search Events"
    >
      {({ onScroll, scrollEnabled }) => (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Searchbar
              ref={searchbarRef}
              placeholder="Search"
              onChangeText={onChangeSearch}
              style={styles.searchbar}
              value={searchQuery}
            />
          </View>
          <SectionList
            sections={eventsGroup}
            onScroll={onScroll}
            scrollEnabled={scrollEnabled}
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title, subtitle } }) => (
              <SectionHeader title={title} subtitle={subtitle} />
            )}
            renderItem={({ item }) => {
              const eventType = (item as any).eventType;
              
              if (eventType === 'da') {
                const daEvent = item as DAEvent;
                return (
                  <View style={styles.eventItem}>
                    <EventCard
                      event={daEvent}
                      onSelectEvent={() => onSelectEvent(daEvent, 'da')}
                      options={{
                        showDate: true,
                        showBookmark: true,
                        showVenue: true,
                        showImage: true,
                      }}
                    />
                  </View>
                );
              } else if (eventType === 'luma') {
                const lumaEvent = item as LumaEvent;
                return (
                  <View style={styles.eventItem}>
                    <LumaEventCard
                      event={lumaEvent}
                      onSelectEvent={() => onSelectEvent(lumaEvent, 'luma')}
                      options={{
                        showLocation: true,
                        showImage: true,
                        showHosts: true,
                      }}
                    />
                  </View>
                );
              } else if (eventType === 'ra') {
                const raEvent = item as RAEvent;
                return (
                  <View style={styles.eventItem}>
                    <RAEventCard
                      event={raEvent}
                      onSelectEvent={() => onSelectEvent(raEvent, 'ra')}
                      options={{
                        showVenue: true,
                        showImage: true,
                        showArtists: true,
                      }}
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events found</Text>
              </View>
            }
          />
        </View>
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchbar: {
    backgroundColor: "transparent",
  },
  listContent: {
    paddingBottom: 16,
  },
  eventItem: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

