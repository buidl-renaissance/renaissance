import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Dimensions,
} from "react-native";
import moment from "moment";
import { SectionHeader } from "../Components/SectionHeader";
import { EventCard } from "../Components/EventCard";
import { LumaEventCard } from "../Components/LumaEventCard";
import { RAEventCard } from "../Components/RAEventCard";
import { EventWebModal } from "../Components/EventWebModal";
import { DAEvent, LumaEvent, RAEvent } from "../interfaces";

const { width } = Dimensions.get("window");

interface CalendarViewScreenProps {
  route: {
    params?: {
      selectedDate?: string; // YYYY-MM-DD format
      eventsGroup?: Array<{
        data: (DAEvent | LumaEvent | RAEvent)[];
        title: string;
        subtitle: string;
        sortDate?: number;
        dateKey?: string;
      }>;
    };
  };
  navigation: any;
}

const CalendarViewScreen: React.FC<CalendarViewScreenProps> = ({
  route,
  navigation,
}) => {
  const selectedDate = route.params?.selectedDate
    ? moment(route.params.selectedDate)
    : moment().startOf("day");

  const eventsGroup = route.params?.eventsGroup || [];

  const [webModalVisible, setWebModalVisible] = React.useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = React.useState<string | null>(null);
  const [webModalTitle, setWebModalTitle] = React.useState<string>("");
  const [webModalEventType, setWebModalEventType] = React.useState<
    "ra" | "luma" | "da" | undefined
  >(undefined);
  const [webModalEventData, setWebModalEventData] = React.useState<any>(null);

  const sectionListRef = React.useRef<SectionList>(null);

  React.useEffect(() => {
    navigation.setOptions({
      title: selectedDate.format("MMMM YYYY"),
      headerStyle: {
        backgroundColor: "#d2e4dd",
      },
      headerTintColor: "#000",
    });
  }, [selectedDate, navigation]);

  // Scroll to selected date when component mounts or date changes
  React.useEffect(() => {
    if (eventsGroup.length > 0 && sectionListRef.current) {
      const targetDateKey = selectedDate.format("YYYY-MM-DD");
      const sectionIndex = eventsGroup.findIndex((group: any) => {
        const groupDateKey =
          group.dateKey || moment(group.sortDate).format("YYYY-MM-DD");
        return groupDateKey === targetDateKey;
      });

      if (sectionIndex >= 0) {
        // Use setTimeout to ensure the list has rendered
        setTimeout(() => {
          sectionListRef.current?.scrollToLocation({
            sectionIndex,
            itemIndex: 0,
            animated: true,
            viewOffset: 0,
          });
        }, 300);
      }
    }
  }, [selectedDate, eventsGroup]);

  const handleCloseWebModal = React.useCallback(() => {
    setWebModalVisible(false);
    setWebModalUrl(null);
    setWebModalTitle("");
    setWebModalEventType(undefined);
    setWebModalEventData(null);
  }, []);

  const handlePressEvent = React.useCallback(
    (event: DAEvent) => {
      navigation.push("Event", {
        event,
      });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <SectionList
        ref={sectionListRef}
        sections={eventsGroup}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title, subtitle } }) => (
          <SectionHeader title={title} subtitle={subtitle} />
        )}
        renderItem={({ item }) => {
          const eventType = (item as any).eventType;

          if (eventType === "luma") {
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
                  onSelectEvent={() => {
                    setWebModalUrl(`https://lu.ma/${lumaEvent.url}`);
                    setWebModalTitle(lumaEvent.name);
                    setWebModalEventType("luma");
                    setWebModalEventData(lumaEvent);
                    setWebModalVisible(true);
                  }}
                />
              </View>
            );
          }

          if (eventType === "ra") {
            const raEvent = item as RAEvent & { isFeatured?: boolean };
            return (
              <View style={{ paddingHorizontal: 16 }}>
                <RAEventCard
                  event={raEvent}
                  options={{
                    showVenue: true,
                    showImage: true,
                    showArtists: true,
                  }}
                  isFeatured={raEvent.isFeatured}
                  onSelectEvent={() => {
                    setWebModalUrl(`https://ra.co${raEvent.contentUrl}`);
                    setWebModalTitle(raEvent.title);
                    setWebModalEventType("ra");
                    setWebModalEventData(raEvent);
                    setWebModalVisible(true);
                  }}
                />
              </View>
            );
          }

          const daEvent = item as DAEvent;
          return (
            <View style={{ paddingHorizontal: 16 }}>
              <EventCard
                event={daEvent}
                options={{
                  showBookmark: true,
                  showVenue: true,
                  showImage: true,
                }}
                onSelectEvent={() => handlePressEvent(daEvent)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No events found for {selectedDate.format("MMMM Do, YYYY")}
            </Text>
          </View>
        }
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default CalendarViewScreen;

