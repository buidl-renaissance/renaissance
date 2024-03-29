import React from "react";
import {
  Dimensions,
  ScrollView,
  SectionList,
  StyleSheet,
  Image,
  Text,
  View,
} from "react-native";

import { HeroBanner } from "../Components/HeroBanner";
import FilterBubble from "../Components/FilterBubble";

import { getProvider } from "../utils/web3";

import { EventCard } from "../Components/EventCard";
import Icon, { IconTypes } from "../Components/Icon";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { SuggestedActivities } from "../Components/SuggestedActivities";
import { FloatingButton } from "../Components/FloatingButton";
import { SectionTitle } from "../Components/SectionTitle";

import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import EventPopup from "../Components/EventPopup";

import { DAEvent, Weather } from "../interfaces";
import { RoundButton } from "../Components/RoundButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getWallet } from "../utils/wallet";
import { GrantOpportunities } from "../Components/GrantOpportunities";
import { Button } from "../Components/Button";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const CalendarScreen = ({ navigation }) => {
  const [events, setEvents] = React.useState<DAEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = React.useState<DAEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: DAEvent[]; title: string }[]
  >([]);
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(
    null
  );

  const [weather, setWeather] = React.useState<Weather>();
  const [time, setTime] = React.useState<string>("");

  const [filter, setFilter] = React.useState<string>("all");

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

  const handleBookmarkPress = React.useCallback(() => {
    navigation.push("Bookmarks");
  }, []);

  const handleSharePress = React.useCallback(() => {
    navigation.push("Share");
  }, []);

  const handleAddEvent = React.useCallback(() => {
    (async () => {
      // const provider = getProvider();
      // // const res = await provider.getBlockNumber();
      // const res = (await provider.getBalance('0xb96EF9ad80bAc8d117e2744e5b9B1C6357471C70')).toJSON();
      // console.log('provider.getBalance("0xb96EF9ad80bAc8d117e2744e5b9B1C6357471C70")', res, res.hex, Number(res.hex));
      const wallet = await getWallet();
      // console.log("wallet: ", wallet);
      console.log("address:", wallet.address);
      // console.log("publicKey:", wallet.publicKey);
      // console.log("privateKey:", wallet.privateKey);
      // console.log("mnemonic:", wallet.mnemonic);
      const signature = await wallet.signMessage('Hello World!');
      console.log('signature: ', signature);
    })();
    // navigation.push("CreateEvent");
  }, []);

  const handleShowProposals = React.useCallback(() => {
    navigation.push("ProposalList");
  }, []);

  const handleCreateGrant = React.useCallback(() => {
    navigation.push("CreateGrant");
  }, []);

  const handleShowAccount = React.useCallback(() => {
    navigation.push("Account");
  }, []);

  const updateEvents = React.useCallback(() => {
    (async () => {
      console.log("UPDATE EVENTS!!");
      const eventsRes = await fetch("https://api.dpop.tech/api/events");
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  const updateWeather = React.useCallback(() => {
    (async () => {
      console.log("UPDATE WEATHER!!");
      const weatherRes = await fetch(
        "https://api.weather.gov/gridpoints/DTX/66,34/forecast/hourly"
      );
      const weatherData = await weatherRes.json();
      setWeather(weatherData);
    })();
  }, []);

  React.useEffect(() => {
    updateEvents();
    updateWeather();
    setTimeout(() => {
      updateEvents();
      updateWeather();
    }, 10 * 60 * 1000);
  }, []);

  React.useEffect(() => {
    setFilteredEvents(
      events.filter((event: DAEvent) => {
        if (filter === "featured" && event.featured) {
          return true;
        }
        if (filter === "all") {
          return true;
        }
        if (filter === "art" && event.categories?.includes("Art")) {
          return true;
        }
        if (filter === "tech" && event.categories?.includes("Tech")) {
          return true;
        }
        if (filter === "sports" && event.categories?.includes("Sports")) {
          return true;
        }
        if (
          filter === "music" &&
          (event.categories?.includes("Music") ||
            event.categories?.includes("TheDetroitILove"))
        ) {
          return true;
        }
        if (filter === "fitness" && event.categories?.includes("Fitness")) {
          return true;
        }
        if (
          filter === "networking" &&
          (event.title.match("Networking") ||
            event.categories?.includes("Networking"))
        ) {
          return true;
        }
        return false;
        // return moment(event.end_date).subtract(1, "week").isAfter()
        //   ? false
        //   : true;
      })
    );
  }, [events, filter]);

  React.useEffect(() => {
    const groups = {};
    filteredEvents.map((event: DAEvent) => {
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
  }, [filteredEvents]);

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
        <HeroBanner>
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
          {/* {username && pub && sig && <QRCode value={`://dpop:pub:${pub}:sig:${sig}:${username}`} />} */}
          {/* {username && pub && sig && } */}
          <View style={{ flex: 1, flexDirection: "row", marginTop: 8 }}>
            <RoundButton
              onPress={handleToggleDisplay}
              type={IconTypes.Ionicons}
              name={"map-outline"}
            />
            <RoundButton
              onPress={handleSearchPress}
              type={IconTypes.Ionicons}
              name={"search"}
            />
            <RoundButton
              onPress={handleBookmarkPress}
              type={IconTypes.Ionicons}
              name={"bookmark-outline"}
            />
            <RoundButton
              onPress={handleSharePress}
              type={IconTypes.Ionicons}
              name={"share"}
            />
            <RoundButton
              onPress={handleShowAccount}
              type={IconTypes.Ionicons}
              name={"person"}
            />
            <RoundButton
              onPress={handleShowProposals}
              type={IconTypes.Ionicons}
              name={"document-text-outline"}
            />
          </View>
        </HeroBanner>

        <GrantOpportunities />
        <View style={{ paddingHorizontal: 16 }}>
          <Button onPress={handleCreateGrant} title="Add New Grant" />
        </View>

        <SuggestedActivities />

        <SectionTitle>Upcoming Events</SectionTitle>

        <ScrollView
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            borderBottomColor: "#eee",
            borderBottomWidth: 1,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        >
          {/* <FilterBubble
            flat={true}
            active={filter === "featured"}
            name="Featured"
            onPress={() => setFilter("featured")}
          /> */}
          <FilterBubble
            flat={true}
            active={filter === "all"}
            name="All"
            onPress={() => setFilter("all")}
          />
          <FilterBubble
            flat={true}
            active={filter === "art"}
            name="Art"
            onPress={() => setFilter("art")}
          />
          <FilterBubble
            flat={true}
            active={filter === "music"}
            name="Music"
            onPress={() => setFilter("music")}
          />
          <FilterBubble
            flat={true}
            active={filter === "sports"}
            name="Sports"
            onPress={() => setFilter("sports")}
          />
          <FilterBubble
            flat={true}
            active={filter === "fitness"}
            name="Fitness"
            onPress={() => setFilter("fitness")}
          />
          <FilterBubble
            flat={true}
            active={filter === "tech"}
            name="Tech"
            onPress={() => setFilter("tech")}
          />
          <FilterBubble
            flat={true}
            active={filter === "networking"}
            name="Networking"
            onPress={() => setFilter("networking")}
          />
          <View style={{ width: 16, height: 16 }} />
        </ScrollView>
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
              marginBottom: 4,
              marginTop: 8,
              paddingHorizontal: 16,
              backgroundColor: "white",
            }}
          >
            <Text
              style={{
                color: "black",
                fontSize: 22,
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
          const imageHeight = item.image_data?.width
            ? (item.image_data?.height / item.image_data?.width) *
                Dimensions.get("window").width -
              54
            : 360;

          return (
            <View>
              <View style={{ paddingHorizontal: 16 }}>
                <EventCard
                  event={item}
                  options={{ showBookmark: true, showVenue: true }}
                  onSelectEvent={() => handlePressEvent(item)}
                />
                {item.featured && item.image && (
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
            </View>
          );
        }}
      />
      {/* <FloatingButton onPress={handleAddEvent} /> */}
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
