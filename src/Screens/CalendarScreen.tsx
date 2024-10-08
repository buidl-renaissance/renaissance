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

import { getProvider } from "../utils/web3";

import { EventCard } from "../Components/EventCard";
import Icon, { IconTypes } from "../Components/Icon";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { SuggestedActivities } from "../Components/SuggestedActivities";
import { FloatingButton } from "../Components/FloatingButton";
import { SectionTitle } from "../Components/SectionTitle";

import moment, { weekdays } from "moment";
import EventPopup from "../Components/EventPopup";

import { DAArtwork, DAEvent, DAFlyer, Weather } from "../interfaces";
import { RoundButton } from "../Components/RoundButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getWallet } from "../utils/wallet";
import { Activities } from "../Components/Activities";
import { GrantOpportunities } from "../Components/GrantOpportunities";
import { Button } from "../Components/Button";
import { useEvents } from "../hooks/useEvents";
import { useWeather } from "../hooks/useWeather";
import { useContact } from "../hooks/useContact";
import { useFlyers } from "../hooks/useFlyers";
import { FlyerCard } from "../Components/FlyerCard";
import { SectionHeader } from "../Components/SectionHeader";
import { useArtworks } from "../hooks/useArtwork";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const CalendarScreen = ({ navigation }) => {
  const [events] = useEvents();
  const [contact] = useContact();
  const [flyers] = useFlyers();
  const [artworks] = useArtworks();

  const [filteredEvents, setFilteredEvents] = React.useState<DAEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: DAEvent[]; title: string; subtitle: string }[]
  >([]);
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(
    null
  );

  const [weather] = useWeather();
  const [time, setTime] = React.useState<string>("");

  const [filter, setFilter] = React.useState<string>("all");

  navigation.setOptions({
    title: "Home",
    headerTitle: () => <HeaderTitleImage />,
    headerShown: false,
  });

  const handleToggleDisplay = React.useCallback(() => {
    navigation.push("BrowseMap");
  }, []);

  const handleActivity = React.useCallback((activity) => {
    navigation.push("Activity", {
      activity,
    });
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

  const handleReviewEvents = React.useCallback(() => {
    navigation.push("ReviewEvents");
  }, []);

  const handleShowArtwork = React.useCallback((artwork: DAArtwork) => {
    navigation.push("Artwork", {
      artwork,
    });
  }, []);

  const handleAddEvent = React.useCallback(() => {
    // (async () => {
    //   const wallet = await getWallet();
    //   console.log("address:", wallet.address);
    //   const signature = await wallet.signMessage('Hello World!');
    //   console.log('signature: ', signature);
    // })();
    // navigation.push("CreateEvent");
    navigation.push("CreateFlyer");
  }, []);

  const handleChatPress = React.useCallback(() => {
    navigation.push("Chat");
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
        const date = start.format("MMMM Do");
        const subtitle = start.format("dddd");
        if (!groups[date]) {
          groups[date] = {
            title: date,
            subtitle: subtitle,
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
  }, []);

  // const [username, setUsername] = React.useState("wiredinsamurai");
  // const [pub, setPub] = React.useState("test");
  // const [sig, setSig] = React.useState("test");
  // console.log(username, pub, sig);
  // React.useEffect(() => {
  //     username && pug && sig
  // }, []);

  const handleLogin = React.useCallback(() => {
    navigation.push("Account");
  }, []);

  const sectionHeader = () => {
    return (
      <View>
        <HeroBanner handleLogin={handleLogin}>
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
              onPress={handleChatPress}
              type={IconTypes.MaterialIcons}
              name={"chat"}
            />
            <RoundButton
              onPress={handleSharePress}
              type={IconTypes.Ionicons}
              name={"share"}
            />
            {contact?.id === 1 && (
              <RoundButton
                onPress={handleReviewEvents}
                type={IconTypes.MaterialIcons}
                name={"create-new-folder"}
              />
            )}
          </View>
        </HeroBanner>

        {/* <GrantOpportunities />
        <View style={{ paddingHorizontal: 16 }}>
          <Button onPress={handleCreateGrant} title="Add New Grant" />
        </View> */}

        {/* <Activities onPress={handleActivity} /> */}
        {/* <SuggestedActivities /> */}

        {/* <SectionTitle>What Up Doe?</SectionTitle> */}

        {artworks && artworks?.length > 0 && (
          <View>
            <SectionTitle>GODS WORK</SectionTitle>
            <ScrollView
              style={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 8,
              }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {artworks?.map((artwork) => {
                if (!artwork.data?.image) return <View />;
                return (
                  <TouchableOpacity
                    style={{ marginRight: 16 }}
                    onPress={() => handleShowArtwork(artwork)}
                  >
                    {artwork.data?.image && (
                      <Image
                        source={{
                          uri: artwork.data.image,
                        }}
                        style={{
                          height: 160,
                          width: 160,
                          borderRadius: 4,
                          resizeMode: "cover",
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <Text>{artwork.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* {flyers?.length > 0 && (
          <View
            style={{
              backgroundColor: "#eee",
              borderBottomWidth: 1,
              borderColor: "#aaa",
            }}
          >
            <SectionTitle>FEATURED EVENTS</SectionTitle>
            {flyers.map((flyer: DAFlyer, f) => {
              return (
                <FlyerCard
                  flyer={flyer}
                  key={f}
                  onSelectEvent={handlePressEvent}
                />
              );
            })}
          </View>
        )} */}

        <SectionTitle>EVENT CALENDAR</SectionTitle>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={eventsGroup}
        ListHeaderComponent={sectionHeader()}
        renderSectionHeader={({ section: { title, subtitle } }) => (
          <SectionHeader title={title} subtitle={subtitle} />
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
                  options={{
                    showBookmark: true,
                    showVenue: true,
                    showImage: true,
                  }}
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
      {contact?.id && <FloatingButton onPress={handleAddEvent} />}
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
