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
import { theme } from "../colors";

const ActivityScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: route?.params?.activity,
  });

  const { events } = useEvents({
    type: route?.params?.activity
  });
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
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search"
              onChangeText={onChangeSearch}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
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
    backgroundColor: theme.background,
    flexDirection: "column",
    borderColor: theme.border,
    borderTopWidth: 1,
  },
  searchContainer: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchbar: {
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  searchInput: {
    fontSize: 16,
    color: theme.text,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    borderColor: theme.border,
    borderBottomWidth: 1,
    backgroundColor: theme.surface,
  },
});

export default ActivityScreen;
