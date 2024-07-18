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

import { Button, Searchbar } from "react-native-paper";

import { EventCard } from "../Components/EventCard";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import FilterBubble from "../Components/FilterBubble";

import { lightGreen } from "../colors";
import moment from "moment";
import { DAEvent } from "../interfaces";
import { ScrollView } from "react-native-gesture-handler";

const SearchScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [filters, setFilters] = React.useState({});
  const [events, setEvents] = React.useState([]);
  const [filteredEvents, setFilteredEvents] = React.useState([]);

  const [art, setArt] = React.useState<boolean>(false);
  const [music, setMusic] = React.useState<boolean>(false);
  const [sports, setSports] = React.useState<boolean>(false);
  const [fitness, setFitness] = React.useState<boolean>(false);
  const [tech, setTech] = React.useState<boolean>(false);
  const [networking, setNetworking] = React.useState<boolean>(false);

  const [searchQuery, setSearchQuery] = React.useState("");

  const onChangeSearch = (query) => setSearchQuery(query);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      const eventsRes = await fetch("https://api.detroiter.network/api/events");
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  React.useEffect(() => {
    setFilteredEvents(
      events.filter((event: DAEvent) => {
        const textMatch =
          !searchQuery?.length ||
          (searchQuery?.length && event.title.match(searchQuery));
        if (art || music || fitness || sports || tech || networking) {
          if (art && event.categories?.includes("Art")) {
            return true && textMatch;
          }
          if (tech && event.categories?.includes("Tech")) {
            return true && textMatch;
          }
          if (music && event.categories?.includes("Music")) {
            return true && textMatch;
          }
          if (sports && event.categories?.includes("Sports")) {
            return true && textMatch;
          }
          if (fitness && event.categories?.includes("Fitness")) {
            return true && textMatch;
          }
          if (
            networking &&
            (event.title.match("Networking") ||
              event.categories?.includes("Networking"))
          ) {
            return true && textMatch;
          }
          return false;
        }
        if (searchQuery?.length && textMatch) return true;
        return moment(event.end_date).subtract(1, "week").isAfter()
          ? false
          : true && textMatch;
      })
    );
  }, [events, searchQuery, art, music, fitness, tech, networking]);

  //   filteredEvents.map((event) => {
  //     console.log(event);
  //   });

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
            <ScrollView
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomColor: "#ccc",
                borderBottomWidth: 1,
                borderTopColor: "#ddd",
                borderTopWidth: 1,
              }}
              horizontal={true}
            >
              <FilterBubble
                active={art}
                name="Art"
                onPress={() => setArt(!art)}
              />
              <FilterBubble
                active={music}
                name="Music"
                onPress={() => setMusic(!music)}
              />
              <FilterBubble
                active={sports}
                name="Sports"
                onPress={() => setSports(!sports)}
              />
              <FilterBubble
                active={fitness}
                name="Fitness"
                onPress={() => setFitness(!fitness)}
              />
              <FilterBubble
                active={tech}
                name="Tech"
                onPress={() => setTech(!tech)}
              />
              <FilterBubble
                active={networking}
                name="Networking"
                onPress={() => setNetworking(!networking)}
              />
              <View style={{ width: 12 }} />
            </ScrollView>
          </View>
          <FlatList
            data={filteredEvents}
            // getItemCount={() => events?.length ?? 0}
            // getItem={(i: number) => events[i]}
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
          {/* <ScrollView style={{ flex: 1, paddingBottom: 32 }}>
            <View style={{ padding: 16 }}></View>
          </ScrollView> */}
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

export default SearchScreen;
