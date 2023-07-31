import React from "react";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
} from "react-native";

import { EventCard } from "../Components/EventCard";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { DAEvent } from "../interfaces";
import { getBookmarks } from "../utils/bookmarks";

const BookmarksScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [events, setEvents] = React.useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = React.useState([]);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      const eventsRes = await fetch("https://api.dpop.tech/api/events");
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const bookmarks = await getBookmarks();
      setBookmarkedEvents(events.filter((event: DAEvent) => {
        return bookmarks.includes(event.id);
      }));
    })();
  }, [events]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flexDirection: "column", display: "flex" }}>
          <FlatList
            data={bookmarkedEvents}
            renderItem={({ item }) => {
              return (
                <View>
                  <TouchableOpacity onPress={() => handlePressEvent(item)}>
                    <View style={{ paddingHorizontal: 4 }}>
                      <EventCard
                        event={item}
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
            }}
          />
        </View>
      </TouchableWithoutFeedback>
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
  buttonContainer: {
    paddingHorizontal: 16,
    // paddingTop: 4,
    // paddingBottom: 32,
    borderColor: "#999",
    borderBottomWidth: 1,
    backgroundColor: "white",
    // backgroundColor: darkGrey,
  },
});

export default BookmarksScreen;
