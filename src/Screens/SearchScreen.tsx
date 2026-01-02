import React from "react";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  StyleSheet,
  View,
  SectionList,
  Text,
  ActivityIndicator,
} from "react-native";

import { Searchbar } from "react-native-paper";

import { EventsSectionList } from "../Components/EventsSectionList";
import EventPopup from "../Components/EventPopup";
import { EventWebModal } from "../Components/EventWebModal";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import moment from "moment";
import { DAEvent, LumaEvent, RAEvent } from "../interfaces";
import { useEvents } from "../hooks/useEvents";
import { useLumaEvents } from "../hooks/useLumaEvents";
import { useRAEvents } from "../hooks/useRAEvents";
import { groupEventsByDate, TypedEvent } from "../utils/eventGrouping";
import { getEventEndDate } from "../utils/eventDates";
import { useWebModal } from "../hooks/useWebModal";

const SearchScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const { events, loading: eventsLoading } = useEvents();
  const lumaQuery = React.useMemo(() => ({ city: "detroit" }), []);
  const { events: lumaEvents, loading: lumaLoading } = useLumaEvents(lumaQuery);
  const { events: raEvents, loading: raLoading } = useRAEvents();

  const [eventsGroup, setEventsGroup] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchbarRef = React.useRef<any>(null);

  // State for event modals
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(null);
  const webModal = useWebModal();

  // Check if any of the event hooks are loading
  const isLoading = eventsLoading || lumaLoading || raLoading;

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Auto-focus search bar when screen opens
  React.useEffect(() => {
    if (searchbarRef.current) {
      setTimeout(() => {
        searchbarRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleSelectEvent = React.useCallback((event: DAEvent | LumaEvent | RAEvent, eventType: 'da' | 'luma' | 'ra') => {
    if (eventType === 'da') {
      setSelectedEvent(event as DAEvent);
    } else if (eventType === 'luma') {
      const lumaEvent = event as LumaEvent;
      webModal.openWebModal(`https://lu.ma/${lumaEvent.url}`, lumaEvent.name, 'luma', lumaEvent);
    } else if (eventType === 'ra') {
      const raEvent = event as RAEvent;
      webModal.openWebModal(`https://ra.co${raEvent.contentUrl}`, raEvent.title, 'ra', raEvent);
    }
  }, [webModal]);

  React.useEffect(() => {
    const query = searchQuery?.trim().toLowerCase() || "";
    const allEvents: TypedEvent[] = [];
    
    // Add DA events
    events.forEach(event => {
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
      const endDate = getEventEndDate(event, eventType);
      
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

    // Group events by date using utility function
    const grouped = groupEventsByDate(filtered);
    setEventsGroup(grouped);
  }, [events, lumaEvents, raEvents, searchQuery]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flexDirection: "column", display: "flex", flex: 1 }}>
          <View style={{ backgroundColor: "#fafafa" }}>
            <Searchbar
              ref={searchbarRef}
              placeholder="Search"
              onChangeText={onChangeSearch}
              style={{ backgroundColor: "transparent" }}
              value={searchQuery}
            />
          </View>
          {isLoading && eventsGroup.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : (
            <EventsSectionList
              eventsGroup={eventsGroup}
              eventRendererProps={{
                containerStyle: styles.eventItem,
                onSelectDAEvent: (event) => handleSelectEvent(event, 'da'),
                onSelectLumaEvent: (event) => handleSelectEvent(event, 'luma'),
                onSelectRAEvent: (event) => handleSelectEvent(event, 'ra'),
                showFeaturedImage: false,
              }}
              emptyText="No events found"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      {selectedEvent && (
        <EventPopup 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}
      <EventWebModal
        isVisible={webModal.webModalVisible}
        url={webModal.webModalUrl}
        title={webModal.webModalTitle}
        onClose={webModal.closeWebModal}
        eventType={webModal.webModalEventType}
        eventData={webModal.webModalEventData}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    borderColor: "#999",
    borderTopWidth: 1,
  },
  eventItem: {
    paddingHorizontal: 16,
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
});

export default SearchScreen;
