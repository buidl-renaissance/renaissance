import React from "react";
import {
  FlatList,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { EventCard } from "../Components/EventCard";

import { DAEvent } from "../interfaces";

const ReviewEventsScreen = ({ navigation }) => {
  navigation.setOptions({
    headerTitle: "Review Events",
  });

  const [events, setEvents] = React.useState<DAEvent[]>([]);

  const updateEvents = React.useCallback(() => {
    (async () => {
      console.log("UPDATE EVENTS!!");
      const eventsRes = await fetch(
        "https://api.dpop.tech/api/events?verified=0"
      );
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  React.useEffect(() => {
    updateEvents();
  }, []);

  const handlePressEvent = React.useCallback((event: DAEvent) => {
    navigation.push("EventEdit", {
      event,
    });
    // setSelectedEvent(event);
  }, []);

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 48 }}
        data={events}
        renderItem={({ item }) => {
          const imageHeight = item.image_data?.width
            ? (item.image_data?.height / item.image_data?.width) *
                Dimensions.get("window").width -
              54
            : 400;
          return (
            <View>
              <EventCard
                event={item}
                options={{ showBookmark: false, showVenue: true, showDate: true }}
                onSelectEvent={() => handlePressEvent(item)}
              />
              {item.image && (
                <TouchableOpacity
                  onPress={() => handlePressEvent(item)}
                  style={{ paddingVertical: 16 }}
                >
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={{
                      height: imageHeight,
                      width: "100%",
                      resizeMode: "cover",
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ReviewEventsScreen;
