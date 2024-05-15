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
  Text,
} from "react-native";

import { Searchbar } from "react-native-paper";

import { EventCard } from "../Components/EventCard";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import { DAEvent } from "../interfaces";
import { useEvents } from "../hooks/useEvents";

const ActivityScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: route?.params?.activity,
  });

  const [ events ] = useEvents();
//   const [ activity, setActivity ] = React.useState(route?.params?.activity ?? null);

  const [searchQuery, setSearchQuery] = React.useState("");

  const onChangeSearch = (query) => setSearchQuery(query);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flexDirection: "column", display: "flex" }}>
          <View style={{ backgroundColor: "#fafafa" }}>
            <Searchbar
              placeholder="Search"
              onChangeText={onChangeSearch}
              style={{ backgroundColor: "transparent" }}
              value={searchQuery}
            />
          </View>
          <FlatList
            data={events}
            renderItem={({ item }) => {
              return (
                <View>
                  <View style={{ paddingHorizontal: 4 }}>
                    <EventCard
                      event={item}
                      onSelectEvent={() => handlePressEvent(item)}
                      options={{
                        showDate: true,
                        showBookmark: true,
                        showVenue: true,
                      }}
                    />
                  </View>
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
    borderColor: "#999",
    borderBottomWidth: 1,
    backgroundColor: "white",
  },
});

export default ActivityScreen;
