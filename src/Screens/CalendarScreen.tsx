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
import { useLumaEvents } from "../hooks/useLumaEvents";
import { useRAEvents } from "../hooks/useRAEvents";
import { useFeaturedRAEvents } from "../hooks/useFeaturedRAEvents";
import { FlyerCard } from "../Components/FlyerCard";
import { SectionHeader } from "../Components/SectionHeader";
import * as Linking from "expo-linking";
import { AudioRecorder } from "../Components/AudioRecorder";
import { ContentView } from "../Components/ContentView";
import { LumaEventCard } from "../Components/LumaEventCard";
import { RAEventCard } from "../Components/RAEventCard";
import { FlyerEventCard } from "../Components/FlyerEventCard";
import { EventWebModal } from "../Components/EventWebModal";
import { LumaEvent, RAEvent } from "../interfaces";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const CalendarScreen = ({ navigation }) => {
  const [events] = useEvents();
  
  // Memoize query objects to prevent unnecessary re-fetches
  const lumaQuery = React.useMemo(() => ({ city: "detroit" }), []);
  const { events: lumaEvents } = useLumaEvents(lumaQuery);
  const { events: raEvents } = useRAEvents();
  const { isFeatured, toggleFeatured } = useFeaturedRAEvents();
  
  const [contact] = useContact();
  const [flyers] = useFlyers();

  const [filteredEvents, setFilteredEvents] = React.useState<DAEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: (DAEvent | LumaEvent | RAEvent)[]; title: string; subtitle: string; type?: string; sortDate?: number }[]
  >([]);
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(
    null
  );

  // Mock flyer event for demonstration (hidden)
  // const mockFlyerEvent = React.useMemo(() => ({
  //   id: 'mock-flyer-1',
  //   title: 'Detroit Art Walk - Holiday Edition',
  //   start_date: moment().add(2, 'days').set({ hour: 18, minute: 0 }).toISOString(),
  //   end_date: moment().add(2, 'days').set({ hour: 21, minute: 0 }).toISOString(),
  //   venue: {
  //     id: 999,
  //     title: 'Eastern Market',
  //   },
  //   eventType: 'flyer',
  //   description: 'Join us for a festive art walk through Eastern Market',
  // }), []);

  const [weather] = useWeather();
  const [time, setTime] = React.useState<string>("");

  const [filter, setFilter] = React.useState<string>("all");
  
  // State for web modal
  const [webModalVisible, setWebModalVisible] = React.useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = React.useState<string | null>(null);
  const [webModalTitle, setWebModalTitle] = React.useState<string>("");
  const [webModalEventType, setWebModalEventType] = React.useState<'ra' | 'luma' | 'da' | undefined>(undefined);
  const [webModalEventData, setWebModalEventData] = React.useState<any>(null);

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

  const handleMiniAppsPress = React.useCallback(() => {
    navigation.push("MiniApps");
  }, []);

  const handleAdminPress = React.useCallback(() => {
    navigation.push("Admin");
  }, []);

  const handleAddEvent = React.useCallback(() => {
    (async () => {
      const wallet = await getWallet();
      console.log("address:", wallet.address);
      const signature = await wallet.signMessage('Hello World!');
      console.log('signature: ', signature);
    })();
    // navigation.push("CreateEvent");
    // navigation.push("CreateFlyer");
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

  const handleCreateFlyer = React.useCallback(() => {
    navigation.push("CreateFlyer");
  }, []);

  const handleOpenArt = React.useCallback(() => {
    navigation.push("Art");
  }, []);

  const handleOpenParking = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://buymyspot.com/detroit",
      title: "Parking",
    });
  }, []);

  const handleOpenMusic = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://ra.co/events/us/detroit",
      title: "Music",
    });
  }, []);

  const handleOpenCollectorQuest = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://collectorquest.ai",
      title: "Quests",
    });
  }, []);

  const handleOpenMysticIsland = React.useCallback(() => {
    navigation.push("MiniApp", {
      url: "https://mystic-island.yourland.network/",
      title: "Mystic Island",
    });
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
    
    // Process existing events
    filteredEvents.map((event: DAEvent) => {
      const start = moment(event.start_date);
      const end = moment(event.end_date);
      if (end.isAfter() && moment(start).add(24, "hour").isAfter()) {
        const dateKey = start.format("YYYY-MM-DD"); // Use sortable key
        const date = start.format("MMMM Do");
        const subtitle = start.format("dddd");
        if (!groups[dateKey]) {
          groups[dateKey] = {
            title: date,
            subtitle: subtitle,
            data: [],
            sortDate: start.valueOf(), // Store timestamp for sorting
          };
        }
        groups[dateKey].data.push({ ...event, eventType: "da" });
      }
    });

    // Add mock flyer event (hidden)
    // const mockStart = moment(mockFlyerEvent.start_date);
    // const mockEnd = moment(mockFlyerEvent.end_date);
    // if (mockEnd.isAfter() && moment(mockStart).add(24, "hour").isAfter()) {
    //   const dateKey = mockStart.format("YYYY-MM-DD");
    //   const date = mockStart.format("MMMM Do");
    //   const subtitle = mockStart.format("dddd");
    //   if (!groups[dateKey]) {
    //     groups[dateKey] = {
    //       title: date,
    //       subtitle: subtitle,
    //       data: [],
    //       sortDate: mockStart.valueOf(),
    //     };
    //   }
    //   groups[dateKey].data.push(mockFlyerEvent);
    // }

    // Process Luma events
    lumaEvents.map((event: LumaEvent) => {
      const start = moment(event.startAt);
      const end = moment(event.endAt);
      if (end.isAfter() && moment(start).add(24, "hour").isAfter()) {
        const dateKey = start.format("YYYY-MM-DD");
        const date = start.format("MMMM Do");
        const subtitle = start.format("dddd");
        if (!groups[dateKey]) {
          groups[dateKey] = {
            title: date,
            subtitle: subtitle,
            data: [],
            sortDate: start.valueOf(),
          };
        }
        groups[dateKey].data.push({ ...event, eventType: "luma" });
      }
    });

    // Process RA events
    raEvents.map((event: RAEvent) => {
      const start = moment(event.startTime);
      const end = moment(event.endTime);
      if (end.isAfter() && moment(start).add(24, "hour").isAfter()) {
        const dateKey = start.format("YYYY-MM-DD");
        const date = start.format("MMMM Do");
        const subtitle = start.format("dddd");
        if (!groups[dateKey]) {
          groups[dateKey] = {
            title: date,
            subtitle: subtitle,
            data: [],
            sortDate: start.valueOf(),
          };
        }
        groups[dateKey].data.push({ 
          ...event, 
          eventType: "ra",
          isFeatured: isFeatured(event.id)
        });
      }
    });

    // Sort events within each group by start time
    Object.values(groups).forEach((group: any) => {
      group.data.sort((a, b) => {
        let aStart, bStart;
        
        // Get start time for event a
        if (a.eventType === "luma") {
          aStart = moment(a.startAt);
        } else if (a.eventType === "ra") {
          aStart = moment(a.startTime);
        } else {
          // DA events and flyer events use start_date
          aStart = moment(a.start_date);
        }
        
        // Get start time for event b
        if (b.eventType === "luma") {
          bStart = moment(b.startAt);
        } else if (b.eventType === "ra") {
          bStart = moment(b.startTime);
        } else {
          // DA events and flyer events use start_date
          bStart = moment(b.start_date);
        }
        
        // Validate both dates are valid
        if (!aStart.isValid()) {
          console.warn("Invalid start date for event:", a);
          return 1; // Push invalid events to end
        }
        if (!bStart.isValid()) {
          console.warn("Invalid start date for event:", b);
          return -1; // Push invalid events to end
        }
        
        return aStart.diff(bStart);
      });
    });

    // Sort groups by date chronologically
    const groupsArray = Object.values(groups) as any;
    groupsArray.sort((a: any, b: any) => a.sortDate - b.sortDate);
    
    setEventsGroup(groupsArray);
    
    // Debug logging
    console.log("COMPUTE EVENT GROUPS with Luma and RA events");
    groupsArray.forEach((group: any) => {
      console.log(`\n${group.title} - ${group.data.length} events`);
      group.data.forEach((event: any, index: number) => {
        const startTime = event.eventType === "luma" 
          ? moment(event.startAt).format("h:mm a")
          : event.eventType === "ra"
          ? moment(event.startTime).format("h:mm a")
          : moment(event.start_date).format("h:mm a");
        console.log(`  ${index + 1}. [${event.eventType}] ${startTime} - ${event.title || event.name}`);
      });
    });
  }, [filteredEvents, lumaEvents, raEvents, isFeatured]);

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
            <RoundButton
              onPress={handleMiniAppsPress}
              type={IconTypes.Ionicons}
              name={"apps-outline"}
            />
            {contact?.id === 1 && (
              <RoundButton
                onPress={handleAdminPress}
                type={IconTypes.Ionicons}
                name={"settings-outline"}
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

        {/* <AudioRecorder /> */}


        {flyers?.length > 0 && (
          <View
            style={{
              backgroundColor: "#eee",
              borderBottomWidth: 1,
              borderColor: "#aaa",
            }}
          >
            <SectionTitle>COMMUNITY EVENTS</SectionTitle>
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
        )}

        {/* Mini Apps Section */}
        <View style={{ 
          flexDirection: "row", 
          paddingHorizontal: 12, 
          paddingVertical: 16,
          justifyContent: "space-between",
        }}>
          <TouchableOpacity 
            onPress={handleOpenArt}
            style={{
              alignItems: "center",
              width: 66,
            }}
          >
            <View style={{
              backgroundColor: "#EC4899",
              borderRadius: 14,
              width: 66,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}>
              <Text style={{ fontSize: 30 }}>🎨</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", color: "#333", textAlign: "center" }}>Art</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenParking}
            style={{
              alignItems: "center",
              width: 66,
            }}
          >
            <View style={{
              backgroundColor: "#10B981",
              borderRadius: 14,
              width: 66,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}>
              <Text style={{ fontSize: 30 }}>🅿️</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", color: "#333", textAlign: "center" }}>Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenMusic}
            style={{
              alignItems: "center",
              width: 66,
            }}
          >
            <View style={{
              backgroundColor: "#F59E0B",
              borderRadius: 14,
              width: 66,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}>
              <Text style={{ fontSize: 30 }}>🎵</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", color: "#333", textAlign: "center" }}>Music</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenCollectorQuest}
            style={{
              alignItems: "center",
              width: 66,
            }}
          >
            <View style={{
              backgroundColor: "#3B82F6",
              borderRadius: 14,
              width: 66,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}>
              <Text style={{ fontSize: 30 }}>🏆</Text>
            </View>
            <Text style={{ fontSize: 9, fontWeight: "600", color: "#333", textAlign: "center" }}>Quests</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleOpenMysticIsland}
            style={{
              alignItems: "center",
              width: 66,
            }}
          >
            <View style={{
              backgroundColor: "#6366F1",
              borderRadius: 14,
              width: 66,
              height: 66,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}>
              <Text style={{ fontSize: 30 }}>🏝️</Text>
            </View>
            <Text style={{ 
              fontSize: 9, 
              fontWeight: "600", 
              color: "#333",
              textAlign: "center",
            }}>Mystic Island</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ color: "#999", fontSize: 18, fontWeight: "bold", flex: 1 }}>
            EVENT CALENDAR
          </Text>
          <TouchableOpacity onPress={handleCreateFlyer} style={{ padding: 4 }}>
            <Icon
              type={IconTypes.Ionicons}
              name="add-circle-outline"
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleCloseWebModal = React.useCallback(() => {
    setWebModalVisible(false);
    setWebModalUrl(null);
    setWebModalTitle("");
    setWebModalEventType(undefined);
    setWebModalEventData(null);
  }, []);

  const handleToggleFeatured = React.useCallback(async (eventData: any) => {
    const success = await toggleFeatured(eventData);
    if (success) {
      // Force re-computation of event groups to reflect the change
      setEventsGroup((prev) => [...prev]);
    }
  }, [toggleFeatured]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={eventsGroup}
        ListHeaderComponent={sectionHeader()}
        renderSectionHeader={({ section: { title, subtitle } }) => (
          <SectionHeader title={title} subtitle={subtitle} />
        )}
        renderItem={({ item }) => {
          const eventType = (item as any).eventType;

          if (eventType === "flyer") {
            return (
              <FlyerEventCard
                event={item}
                onSelectEvent={() => {
                  // Could open event details or edit screen
                  console.log("Flyer event pressed:", item);
                }}
              />
            );
          }

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
                    setWebModalEventType('ra');
                    setWebModalEventData(raEvent);
                    setWebModalVisible(true);
                  }}
                />
              </View>
            );
          }

          const daEvent = item as DAEvent;
          const imageHeight = daEvent.image_data?.width
            ? (daEvent.image_data?.height / daEvent.image_data?.width) *
                Dimensions.get("window").width -
              54
            : 360;

          return (
            <View>
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
                {daEvent.featured && daEvent.image && (
                  <TouchableOpacity
                    onPress={() => handlePressEvent(daEvent)}
                    style={{ paddingVertical: 16 }}
                  >
                    <Image
                      source={{
                        uri: daEvent.image,
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
      {contact?.id && <FloatingButton onPress={handleAddEvent} icon="mic" />}
      {selectedEvent && <EventPopup event={selectedEvent} />}
      <EventWebModal
        isVisible={webModalVisible}
        url={webModalUrl}
        title={webModalTitle}
        onClose={handleCloseWebModal}
        eventType={webModalEventType}
        eventData={webModalEventData}
        isFeatured={webModalEventData ? isFeatured(webModalEventData.id) : false}
        onToggleFeatured={handleToggleFeatured}
      />
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
