import React from "react";
import {
  View,
  StyleSheet,
  SectionList,
} from "react-native";
import moment from "moment";
import { EventsSectionList } from "../Components/EventsSectionList";
import { EventWebModal } from "../Components/EventWebModal";
import { useWebModal } from "../hooks/useWebModal";
import { DAEvent, LumaEvent, RAEvent } from "../interfaces";
import { theme } from "../colors";

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

  const webModal = useWebModal();

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

  const handlePressDAEvent = React.useCallback(
    (event: DAEvent) => {
      navigation.push("Event", {
        event,
      });
    },
    [navigation]
  );

  const handlePressLumaEvent = React.useCallback((event: LumaEvent) => {
    webModal.openWebModal(`https://lu.ma/${event.url}`, event.name, 'luma', event);
  }, [webModal]);

  const handlePressRAEvent = React.useCallback((event: RAEvent) => {
    webModal.openWebModal(`https://ra.co${event.contentUrl}`, event.title, 'ra', event);
  }, [webModal]);

  return (
    <View style={styles.container}>
      <EventsSectionList
        ref={sectionListRef}
        eventsGroup={eventsGroup}
        eventRendererProps={{
          containerStyle: { paddingHorizontal: 16 },
          onSelectDAEvent: handlePressDAEvent,
          onSelectLumaEvent: handlePressLumaEvent,
          onSelectRAEvent: handlePressRAEvent,
          showFeaturedImage: false,
        }}
        emptyText={`No events found for ${selectedDate.format("MMMM Do, YYYY")}`}
        listStyle={{ flex: 1 }}
      />
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
});

export default CalendarViewScreen;

