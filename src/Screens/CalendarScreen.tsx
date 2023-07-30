import React from "react";
import {
  Animated,
  Button,
  Dimensions,
  FlatList,
  AppState,
  ImageBackground,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TouchableOpacity } from "react-native-gesture-handler";

import QRCode from "react-qr-code";
import * as Updates from "expo-updates";

import { checkForUpdates } from "../utils/checkForUpdate";

import { EventCard } from "../Components/EventCard";
import Icon, { IconTypes } from "../Components/Icon";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import EventPopup from "../Components/EventPopup";

import { DAEvent, Weather } from "../interfaces";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const CalendarScreen = ({ navigation }) => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: DAEvent[]; title: string }[]
  >([]);
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(
    null
  );

  const [weather, setWeather] = React.useState<Weather>();
  const [time, setTime] = React.useState<string>("");

  navigation.setOptions({
    title: "Home",
    headerTitle: () => <HeaderTitleImage />,
    headerShown: false,
    // headerRight: () => (
    //     <>
    //         <TouchableOpacity onPress={handleToggleDisplay} style={{ marginRight: 16, opacity: 0 }}>
    //             <Icon type={IconTypes.Ionicons} size={20} color="black" name={display === 'list' ? 'map-outline' : 'list-outline'} />
    //         </TouchableOpacity>
    //         <TouchableOpacity onPress={pickImage} style={{ marginRight: 16, paddingBottom: 12 }}>
    //             <Icon type={IconTypes.MaterialCommunityIcons} size={24} color="black" name={'plus-box-multiple'} />
    //         </TouchableOpacity>
    //     </>
    // ),
  });

  // const pickImage = async () => {
  //   // No permissions request is necessary for launching the image library
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.cancelled) {
  //     setImage(result.uri);
  //   }
  // };

  const handleToggleDisplay = React.useCallback(() => {
    navigation.push("BrowseMap");
  }, []);

  const handleSearchPress = React.useCallback(() => {
    navigation.push("Search");
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
      const weatherRes = await fetch(
        "https://api.weather.gov/gridpoints/DTX/66,34/forecast/hourly"
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData);
    })();
  }, []);

  React.useEffect(() => {
    const groups = {};
    events.map((event: DAEvent) => {
      const start = moment(event.start_date);
      const end = moment(event.end_date);
      if (end.isAfter() && moment(start).add(24, "hour").isAfter()) {
        const date = start.format("dddd, MMMM Do");
        if (!groups[date]) {
          groups[date] = {
            title: date,
            data: [],
          };
        }
        groups[date].data.push(event);
      }
    });
    const r = Object.keys(groups);
    setEventsGroup(Object.values(groups) as any);
    console.log("COMPUTE EVENT GROUPS");
  }, [events]);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
    // setSelectedEvent(event);
  }, []);

  // const [username, setUsername] = React.useState("wiredinsamurai");
  // const [pub, setPub] = React.useState("test");
  // const [sig, setSig] = React.useState("test");
  // console.log(username, pub, sig);
  // React.useEffect(() => {
  //     username && pug && sig
  // }, []);

  const sectionHeader = () => {
    return (
      <View>
        <ImageBackground
          source={require("../../assets/renaissance.png")}
          resizeMode="cover"
        >
          <Animated.View
            style={{
              paddingTop: 220,
              paddingHorizontal: 32,
              paddingVertical: 16,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderBottomColor: "gray",
              borderBottomWidth: 1,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 32,
                fontWeight: "bold",
                textAlign: "left",
                marginTop: 8,
              }}
            >
              Welcome to the Renaissance City
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                textAlign: "left",
                marginVertical: 4,
                marginBottom: 8,
              }}
            >
              Unlock the rich tapestry of food, arts, and events that Detroit
              has to offer. {time}
            </Text>
            {weather?.properties?.periods?.length && (
              <View>
                <Text style={{ color: "white", fontSize: 32 }}>
                  {weather?.properties?.periods[0].temperature} °F
                </Text>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {weather?.properties?.periods[0].shortForecast}
                </Text>
              </View>
            )}
            {/* <View style={{ position: 'relative', height: 120 }}>
                                        <View style={{ borderColor: 'white', borderWidth: 5, position: 'absolute' }}>
                                            <QRCode value={`https://testflight.apple.com/join/UszpHYKN`} size={100} />
                                        </View>
                                    </View> */}
            {/* {username && pub && sig && <QRCode value={`://dpop:pub:${pub}:sig:${sig}:${username}`} />} */}
            {/* {username && pub && sig && } */}
            <View style={{ flex: 1, flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                onPress={handleToggleDisplay}
                style={{
                  marginRight: 16,
                  opacity: 1,
                  borderColor: "white",
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 8,
                }}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  size={20}
                  color="white"
                  name={"map-outline"}
                />
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={{
                  marginRight: 16,
                  opacity: 1,
                  borderColor: "white",
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 8,
                }}
              >
                <Icon
                  type={IconTypes.Entypo}
                  size={20}
                  color="white"
                  name={"chat"}
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={{
                  marginRight: 16,
                  opacity: 1,
                  borderColor: "white",
                  borderRadius: 20,
                  borderWidth: 1,
                  padding: 8,
                }}
                onPress={handleSearchPress}
              >
                <Icon
                  type={IconTypes.Feather}
                  size={20}
                  color="white"
                  name={"search"}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={eventsGroup}
        ListHeaderComponent={sectionHeader()}
        renderSectionHeader={({ section: { title } }) => (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "baseline",
              marginBottom: 8,
              marginTop: 22,
              paddingHorizontal: 28,
              paddingBottom: 4,
              backgroundColor: "white",
            }}
          >
            <Text
              style={{
                color: "black",
                fontSize: 28,
                paddingRight: 12,
                fontWeight: "bold",
                textAlign: "left",
                marginTop: 16,
              }}
            >
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          return (
            <View style={{ paddingHorizontal: 28 }}>
              <EventCard
                event={item}
                options={{ showBookmark: true, showVenue: true }}
                onSelectEvent={() => handlePressEvent(item)}
              />
            </View>
          );
        }}
      />
      {selectedEvent && <EventPopup event={selectedEvent} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    borderTopWidth: 1,
    borderColor: "#999",
  },
  cardContainer: {
    backgroundColor: "white",
    // backgroundColor: '#d2e4dd',
    height: 180,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
  },
  venueContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    height: 220, // Dimensions.get("window").height -
    width: Dimensions.get("window").width,
    // borderTopColor: '#ddd',
    // borderTopWidth: 1,
    // borderTopRightRadius: 16,
    // borderTopLeftRadius: 16,
    // backgroundColor: '#d2e4dd',
    paddingLeft: 16,
    paddingRight: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  slide: {},
  title: {
    fontSize: 24,
  },
  flatListContent: {
    // height: CURRENT_ITEM_TRANSLATE_Y * 2 + ITEM_LENGTH,
    // alignItems: 'center',
    marginBottom: CURRENT_ITEM_TRANSLATE_Y,
    paddingRight: 32,
  },
  itemContent: {
    marginHorizontal: SPACING * 3,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: BORDER_RADIUS + SPACING * 2,
    height: 220,
  },
});

export default CalendarScreen;
