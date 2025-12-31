import React from "react";
import {
  Dimensions,
  ScrollView,
  SectionList,
  StyleSheet,
  Image,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";

import { HeroBanner } from "../Components/HeroBanner";

import { getProvider } from "../utils/web3";

import { EventCard } from "../Components/EventCard";
import Icon, { IconTypes } from "../Components/Icon";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { SuggestedActivities } from "../Components/SuggestedActivities";
import { FloatingButton } from "../Components/FloatingButton";
import { FloatingProfileButton } from "../Components/FloatingProfileButton";
import { FloatingActionButtons } from "../Components/FloatingActionButtons";
import { SectionTitle } from "../Components/SectionTitle";
import { MiniAppButton } from "../Components/MiniAppButton";
import { EventForecast } from "../Components/EventForecast";
import { getBookmarkStatusForWebEvent, getBookmarks } from "../utils/bookmarks";
import { getGoingStatusForWebEvent, getGoingEvents } from "../utils/rsvp";
import { EventRegister } from "react-native-event-listeners";

import moment, { weekdays } from "moment";
import EventPopup from "../Components/EventPopup";

import { DAArtwork, DAEvent, DAFlyer, Weather } from "../interfaces";
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
import { useMeetupEvents } from "../hooks/useMeetupEvents";
import { useFeaturedRAEvents } from "../hooks/useFeaturedRAEvents";
import { useSportsGames } from "../hooks/useSportsGames";
import { useAuth } from "../context/Auth";
import { useUSDCBalance } from "../hooks/useUSDCBalance";
import { FlyerCard } from "../Components/FlyerCard";
import { SectionHeader } from "../Components/SectionHeader";
import * as Linking from "expo-linking";
import { AudioRecorder } from "../Components/AudioRecorder";
import { ContentView } from "../Components/ContentView";
import { LumaEventCard } from "../Components/LumaEventCard";
import { RAEventCard } from "../Components/RAEventCard";
import { MeetupEventCard } from "../Components/MeetupEventCard";
import { FlyerEventCard } from "../Components/FlyerEventCard";
import { SportsGameCard } from "../Components/SportsGameCard";
import { EventWebModal } from "../Components/EventWebModal";
import { MiniAppModal } from "../Components/MiniAppModal";
import { QRCodeModal } from "../Components/QRCodeModal";
import { BookmarksModal } from "../Components/BookmarksModal";
import { MiniAppsModal } from "../Components/MiniAppsModal";
import { WalletModal } from "../Components/WalletModal";
import { CreateFlyerModal } from "../Components/CreateFlyerModal";
import { LumaEvent, RAEvent, MeetupEvent } from "../interfaces";
import { SportsGame } from "../api/sports-games";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;


const CalendarScreen = ({ navigation }) => {
  const [events] = useEvents();
  const { state: authState } = useAuth();
  const { balance: walletBalance } = useUSDCBalance();
  
  // Memoize query objects to prevent unnecessary re-fetches
  const lumaQuery = React.useMemo(() => ({ city: "detroit" }), []);
  const { events: lumaEvents } = useLumaEvents(lumaQuery);
  const { events: raEvents } = useRAEvents();
  // NYE-specific RA events use the dedicated NYE endpoint.
  const { events: nyeRaEvents, loading: nyeLoading } = useRAEvents({ type: "nye" });
  const { events: meetupEvents } = useMeetupEvents();
  const { games: sportsGames } = useSportsGames();
  const { isFeatured, toggleFeatured } = useFeaturedRAEvents();
  
  const [contact] = useContact();
  const [flyers] = useFlyers();

  const [filteredEvents, setFilteredEvents] = React.useState<DAEvent[]>([]);
  const [eventsGroup, setEventsGroup] = React.useState<
    { data: (DAEvent | LumaEvent | RAEvent | MeetupEvent | SportsGame)[]; title: string; subtitle: string; type?: string; sortDate?: number; dateKey?: string }[]
  >([]);
  const [selectedEvent, setSelectedEvent] = React.useState<DAEvent | null>(
    null
  );

  const sectionListRef = React.useRef<SectionList>(null);

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
  const [webModalEventType, setWebModalEventType] = React.useState<'ra' | 'luma' | 'da' | 'meetup' | 'sports' | undefined>(undefined);
  const [webModalEventData, setWebModalEventData] = React.useState<any>(null);

  // State for mini app modal
  const [miniAppModalVisible, setMiniAppModalVisible] = React.useState<boolean>(false);
  const [miniAppModalUrl, setMiniAppModalUrl] = React.useState<string | null>(null);
  const [miniAppModalTitle, setMiniAppModalTitle] = React.useState<string>("");

  // State for QR code modal
  const [qrCodeModalVisible, setQrCodeModalVisible] = React.useState<boolean>(false);

  // State for bookmarks modal
  const [bookmarksModalVisible, setBookmarksModalVisible] = React.useState<boolean>(false);

  // State for mini apps modal
  const [miniAppsModalVisible, setMiniAppsModalVisible] = React.useState<boolean>(false);


  // State for create flyer modal
  const [createFlyerModalVisible, setCreateFlyerModalVisible] = React.useState<boolean>(false);

  // State for wallet modal
  const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);

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
  }, [navigation]);

  const handleBookmarkPress = React.useCallback(() => {
    setBookmarksModalVisible(true);
  }, []);

  const handleQRCodePress = React.useCallback(() => {
    setQrCodeModalVisible(true);
  }, []);

  const handleWalletPress = React.useCallback(() => {
    setWalletModalVisible(true);
  }, []);

  const handleMiniAppsPress = React.useCallback(() => {
    setMiniAppsModalVisible(true);
  }, []);

  const handleOpenMiniApp = React.useCallback((app: { url: string; name: string }) => {
    // Check if this is a native screen
    if (app.url.startsWith("native://")) {
      const screenName = app.url.replace("native://", "");
      navigation.push(screenName);
      setMiniAppsModalVisible(false);
    } else {
      // Open web-based mini app
      setMiniAppModalUrl(app.url);
      setMiniAppModalTitle(app.name);
      setMiniAppModalVisible(true);
      setMiniAppsModalVisible(false);
    }
  }, [navigation]);


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
    setCreateFlyerModalVisible(true);
  }, []);

  const handleOpenArt = React.useCallback(() => {
    navigation.push("Art");
  }, []);

  const handleOpenParking = React.useCallback(() => {
    setMiniAppModalUrl("https://buymyspot.com/detroit");
    setMiniAppModalTitle("Parking");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenCoLab = React.useCallback(() => {
    setMiniAppModalUrl("https://co.lab.builddetroit.xyz/");
    setMiniAppModalTitle("Co.Lab");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenCollectorQuest = React.useCallback(() => {
    setMiniAppModalUrl("https://collectorquest.ai");
    setMiniAppModalTitle("Quests");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenRestaurants = React.useCallback(() => {
    navigation.push("Restaurants");
  }, []);

  const handleOpenGloabi = React.useCallback(() => {
    setMiniAppModalUrl("https://gloabi-chat.vercel.app/");
    setMiniAppModalTitle("Gloabi");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenMysticIsland = React.useCallback(() => {
    setMiniAppModalUrl("https://mystic-island.yourland.network/");
    setMiniAppModalTitle("Mystic Island");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenDynoDetroit = React.useCallback(() => {
    setMiniAppModalUrl("https://dynodetroit.com");
    setMiniAppModalTitle("Dyno Detroit");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenHotBones = React.useCallback(() => {
    setMiniAppModalUrl("https://hotbones.com");
    setMiniAppModalTitle("Hot Bones");
    setMiniAppModalVisible(true);
  }, []);

  const handleOpenBeaconHQ = React.useCallback(() => {
    setMiniAppModalUrl("https://www.thebeaconhq.com/");
    setMiniAppModalTitle("The Beacon HQ");
    setMiniAppModalVisible(true);
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
            dateKey: dateKey, // Store dateKey for matching
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
            dateKey: dateKey, // Store dateKey for matching
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
            dateKey: dateKey, // Store dateKey for matching
          };
        }
        groups[dateKey].data.push({ 
          ...event, 
          eventType: "ra",
          isFeatured: isFeatured(event.id)
        });
      }
    });

    // Process Meetup events
    meetupEvents.map((event: MeetupEvent) => {
      const start = moment(event.dateTime);
      // Since we don't have an end time, assume event lasts 2 hours
      const end = moment(event.dateTime).add(2, 'hours');
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
            dateKey: dateKey, // Store dateKey for matching
          };
        }
        groups[dateKey].data.push({ ...event, eventType: "meetup" });
      }
    });

    // Process Sports games
    sportsGames.map((game: SportsGame) => {
      const start = moment(game.startTime);
      // Assume games last 3 hours
      const end = moment(game.startTime).add(3, 'hours');
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
            dateKey: dateKey, // Store dateKey for matching
          };
        }
        groups[dateKey].data.push({ ...game, eventType: "sports" });
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
        } else if (a.eventType === "meetup") {
          aStart = moment(a.dateTime);
        } else if (a.eventType === "sports") {
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
        } else if (b.eventType === "meetup") {
          bStart = moment(b.dateTime);
        } else if (b.eventType === "sports") {
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
  }, [filteredEvents, lumaEvents, raEvents, meetupEvents, sportsGames, isFeatured]);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  // State for forecast data with bookmark and going counts
  const [forecastData, setForecastData] = React.useState<Array<{
    date: moment.Moment;
    dateKey: string;
    eventCount: number;
    isToday: boolean;
    bookmarkedCount: number;
    goingCount: number;
  }>>([]);

  // Calculate event counts for the next 7 days
  React.useEffect(() => {
    const calculateForecast = async () => {
      const today = moment().startOf("day");
      const days: Array<{
        date: moment.Moment;
        dateKey: string;
        eventCount: number;
        isToday: boolean;
        bookmarkedCount: number;
        goingCount: number;
      }> = [];

      // Create maps for event counts, bookmarked, and going
      const eventCountMap: { [key: string]: number } = {};
      const bookmarkedCountMap: { [key: string]: number } = {};
      const goingCountMap: { [key: string]: number } = {};

      // Get bookmark and going IDs once
      const bookmarkIds = await getBookmarks();
      const goingIds = await getGoingEvents();

      // Process eventsGroup to build count maps
      for (const group of eventsGroup) {
        const dateKey = group.dateKey || moment(group.sortDate).format("YYYY-MM-DD");
        eventCountMap[dateKey] = group.data.length;
        bookmarkedCountMap[dateKey] = 0;
        goingCountMap[dateKey] = 0;

        // Check each event in the group for bookmark and going status
        for (const event of group.data) {
          const eventType = event.eventType || 'da';
          let isBookmarked = false;
          let isGoing = false;

          try {
            if (eventType === 'da' && event.id) {
              // Check DA event bookmark and going status
              isBookmarked = bookmarkIds.includes(event.id);
              isGoing = goingIds.includes(event.id);
            } else if (eventType === 'luma' && event.apiId) {
              isBookmarked = await getBookmarkStatusForWebEvent(event, 'luma');
              isGoing = await getGoingStatusForWebEvent(event, 'luma');
            } else if (eventType === 'ra' && event.id) {
              isBookmarked = await getBookmarkStatusForWebEvent(event, 'ra');
              isGoing = await getGoingStatusForWebEvent(event, 'ra');
            } else if (eventType === 'meetup' && event.eventId) {
              isBookmarked = await getBookmarkStatusForWebEvent(event, 'meetup');
              isGoing = await getGoingStatusForWebEvent(event, 'meetup');
            } else if (eventType === 'sports' && event.id) {
              isBookmarked = await getBookmarkStatusForWebEvent(event, 'sports');
              // Sports games don't have going status
              isGoing = false;
            }

            if (isBookmarked) {
              bookmarkedCountMap[dateKey] = (bookmarkedCountMap[dateKey] || 0) + 1;
            }
            if (isGoing) {
              goingCountMap[dateKey] = (goingCountMap[dateKey] || 0) + 1;
            }
          } catch (error) {
            console.error("Error checking bookmark/going status:", error);
          }
        }
      }

      // Generate 7 days starting from today
      for (let i = 0; i < 7; i++) {
        const date = today.clone().add(i, "days");
        const dateKey = date.format("YYYY-MM-DD");
        const isToday = i === 0;

        days.push({
          date,
          dateKey,
          eventCount: eventCountMap[dateKey] || 0,
          isToday,
          bookmarkedCount: bookmarkedCountMap[dateKey] || 0,
          goingCount: goingCountMap[dateKey] || 0,
        });
      }

      setForecastData(days);
    };

    calculateForecast();

    // Listen for bookmark and going status changes
    const bookmarkListener = EventRegister.addEventListener("BookmarkEvent", () => {
      calculateForecast();
    });
    const goingListener = EventRegister.addEventListener("GoingEvent", () => {
      calculateForecast();
    });

    return () => {
      if (typeof bookmarkListener === "string") {
        EventRegister.removeEventListener(bookmarkListener);
      }
      if (typeof goingListener === "string") {
        EventRegister.removeEventListener(goingListener);
      }
    };
  }, [eventsGroup]);

  const get7DayForecast = forecastData;

  // Handle scrolling to a specific day's events
  const handleDayPress = React.useCallback(
    (dateKey: string) => {
      if (!sectionListRef.current || eventsGroup.length === 0) {
        return;
      }

      const targetDate = moment(dateKey);
      
      // First, try to find an exact match for the date
      let sectionIndex = eventsGroup.findIndex((group: any) => {
        const groupDateKey = group.dateKey || moment(group.sortDate).format("YYYY-MM-DD");
        return groupDateKey === dateKey;
      });

      // If no exact match, find the next section with events (closest future date)
      if (sectionIndex < 0) {
        sectionIndex = eventsGroup.findIndex((group: any) => {
          const groupDateKey = group.dateKey || moment(group.sortDate).format("YYYY-MM-DD");
          const groupDate = moment(groupDateKey);
          return groupDate.isSame(targetDate, 'day') || groupDate.isAfter(targetDate, 'day');
        });
      }

      // If we found a valid section, scroll to it
      if (sectionIndex >= 0) {
        const section = eventsGroup[sectionIndex];
        
        // Calculate status bar offset to prevent header from being covered
        const statusBarHeight = Platform.select({
          ios: 108,
          android: StatusBar.currentHeight || 24,
          default: 0,
        });
        
        // Use requestAnimationFrame and setTimeout to ensure the list has fully rendered
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              sectionListRef.current?.scrollToLocation({
                sectionIndex,
                itemIndex: 0,
                animated: true,
                viewOffset: statusBarHeight,
              });
            } catch (error) {
              console.error("Error scrolling to location:", error);
            }
          }, 100);
        });
      }
    },
    [eventsGroup]
  );

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
          paddingVertical: 12,
          justifyContent: "space-between",
        }}>
          <MiniAppButton
            emoji="🎨"
            label="Art"
            backgroundColor="#EC4899"
            onPress={handleOpenArt}
          />
          <MiniAppButton
            emoji="🅿️"
            label="Parking"
            backgroundColor="#10B981"
            onPress={handleOpenParking}
          />
          <MiniAppButton
            emoji="🤝"
            label="Co.Lab"
            backgroundColor="#8B5CF6"
            onPress={handleOpenCoLab}
          />
          <MiniAppButton
            emoji="🏆"
            label="Quests"
            backgroundColor="#3B82F6"
            onPress={handleOpenCollectorQuest}
          />
          <MiniAppButton
            emoji="🍽️"
            label="Restaurants"
            backgroundColor="#F59E0B"
            onPress={handleOpenRestaurants}
          />
        </View>

        {/* Second Row of Mini Apps */}
        <View style={{ 
          flexDirection: "row", 
          paddingHorizontal: 12, 
          paddingVertical: 6,
          justifyContent: "space-between",
        }}>
          <MiniAppButton
            emoji="💬"
            label="Gloabi"
            backgroundColor="#6366F1"
            onPress={handleOpenGloabi}
          />
          <MiniAppButton
            emoji="🏝️"
            label="Mystic Island"
            backgroundColor="#14B8A6"
            onPress={handleOpenMysticIsland}
          />
          <MiniAppButton
            emoji="🧗"
            label="Dyno Detroit"
            backgroundColor="#DC2626"
            onPress={handleOpenDynoDetroit}
          />
          <MiniAppButton
            emoji="🧘"
            label="Hot Bones"
            backgroundColor="#F97316"
            onPress={handleOpenHotBones}
          />
          <MiniAppButton
            emoji="🎮"
            label="Beacon HQ"
            backgroundColor="#059669"
            onPress={handleOpenBeaconHQ}
          />
        </View>

        {/* Plan Your NYE - Featured RA events on New Year's Eve */}
        <View
          style={{
            paddingTop: 8,
          }}
        >
          <SectionTitle>PLAN YOUR NYE</SectionTitle>
          {nyeLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
            >
              {[1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={{
                    marginRight: 12,
                    width: width * 0.35,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 12,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  <View style={{ marginTop: 8 }}>
                    <View
                      style={{
                        width: "60%",
                        height: 12,
                        borderRadius: 4,
                        backgroundColor: "#E5E7EB",
                        marginTop: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : nyeRaEvents.length === 0 ? (
            <Text
              style={{
                color: "#777",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              NYE events coming soon – check back later.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
            >
              {nyeRaEvents.map((raEvent) => {
                const flyerImage =
                  raEvent.images?.find((img) => img.type === "FLYERFRONT")
                    ?.filename || raEvent.flyerFront;

                return (
                  <TouchableOpacity
                    key={raEvent.id}
                    onPress={() => {
                      setWebModalUrl(`https://ra.co${raEvent.contentUrl}`);
                      setWebModalTitle(raEvent.title);
                      setWebModalEventType("ra");
                      setWebModalEventData(raEvent);
                      setWebModalVisible(true);
                    }}
                    activeOpacity={0.85}
                    style={{
                      marginRight: 12,
                      width: width * 0.35,
                    }}
                  >
                    {flyerImage && (
                      <Image
                        source={{ uri: flyerImage }}
                        style={{
                          width: "100%",
                          height: 180,
                          borderRadius: 12,
                          backgroundColor: "#111",
                        }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={{ marginTop: 8 }}>
                      {raEvent.interestedCount !== null &&
                        raEvent.interestedCount > 0 && (
                          <Text
                            style={{
                              marginTop: 2,
                              fontSize: 12,
                              color: "#666",
                            }}
                          >
                            {raEvent.interestedCount} interested
                          </Text>
                        )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>


        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ color: "#999", fontSize: 18, fontWeight: "bold", flex: 1 }}>
            UPCOMING EVENTS
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

        {/* 7-Day Event Forecast */}
        {get7DayForecast.length > 0 && (
          <EventForecast days={get7DayForecast} onDayPress={handleDayPress} />
        )}
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
      {/* Top gradient overlay - fades from white to transparent, faster fade around buttons */}
      <View style={styles.topGradientContainer} pointerEvents="none">
        <Svg height={120} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="topGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <Stop offset="25%" stopColor="white" stopOpacity="0.60" />
              <Stop offset="50%" stopColor="white" stopOpacity="0.25" />
              <Stop offset="70%" stopColor="white" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="white" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#topGradient)" />
        </Svg>
      </View>
      <SectionList
        ref={sectionListRef}
        sections={eventsGroup}
        ListHeaderComponent={sectionHeader()}
        stickySectionHeadersEnabled={false}
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
                    setWebModalEventType('luma');
                    setWebModalEventData(lumaEvent);
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

          if (eventType === "meetup") {
            const meetupEvent = item as MeetupEvent;
            return (
              <View style={{ paddingHorizontal: 16 }}>
                <MeetupEventCard
                  event={meetupEvent}
                  options={{
                    showLocation: true,
                    showImage: true,
                    showGroup: true,
                  }}
                  onSelectEvent={() => {
                    setWebModalUrl(meetupEvent.eventUrl);
                    setWebModalTitle(meetupEvent.title);
                    setWebModalEventType('meetup');
                    setWebModalEventData(meetupEvent);
                    setWebModalVisible(true);
                  }}
                />
              </View>
            );
          }

          if (eventType === "sports") {
            const sportsGame = item as SportsGame;
            return (
              <View style={{ paddingHorizontal: 16 }}>
                <SportsGameCard
                  game={sportsGame}
                  options={{
                    showVenue: true,
                    showImage: true,
                  }}
                  onSelectEvent={() => {
                    if (sportsGame.link) {
                      setWebModalUrl(sportsGame.link);
                      setWebModalTitle(`${sportsGame.awayTeam.shortDisplayName} @ ${sportsGame.homeTeam.shortDisplayName}`);
                      setWebModalEventType('sports');
                      setWebModalEventData(sportsGame);
                      setWebModalVisible(true);
                    }
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
                        backgroundColor: "#E5E7EB",
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
      <FloatingActionButtons
        onSearchPress={handleSearchPress}
        onBookmarkPress={handleBookmarkPress}
        onQRCodePress={authState.isAuthenticated ? handleQRCodePress : undefined}
        onWalletPress={authState.isAuthenticated ? handleWalletPress : undefined}
        onAppsPress={handleMiniAppsPress}
        onAdminPress={handleAdminPress}
        showAdmin={contact?.id === 1}
        walletBalance={walletBalance}
      />
      <FloatingProfileButton navigation={navigation} />
      {selectedEvent && (
        <EventPopup 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}
      <EventWebModal
        isVisible={webModalVisible}
        url={webModalUrl}
        title={webModalTitle}
        onClose={handleCloseWebModal}
        eventType={webModalEventType}
        eventData={webModalEventData}
      />
      <MiniAppModal
        isVisible={miniAppModalVisible}
        url={miniAppModalUrl}
        title={miniAppModalTitle}
        onClose={() => {
          setMiniAppModalVisible(false);
          setMiniAppModalUrl(null);
          setMiniAppModalTitle("");
        }}
      />
      <QRCodeModal
        isVisible={qrCodeModalVisible}
        onClose={() => setQrCodeModalVisible(false)}
        onScanResult={(data) => {
          console.log("QR Code scanned:", data);
          // Handle scanned QR code data here
          setQrCodeModalVisible(false);
        }}
      />
      <WalletModal
        isVisible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
      />
      <CreateFlyerModal
        isVisible={createFlyerModalVisible}
        onClose={() => setCreateFlyerModalVisible(false)}
      />
      <BookmarksModal
        isVisible={bookmarksModalVisible}
        onClose={() => setBookmarksModalVisible(false)}
      />
      <MiniAppsModal
        isVisible={miniAppsModalVisible}
        onClose={() => setMiniAppsModalVisible(false)}
        onOpenApp={handleOpenMiniApp}
        onNavigateToAccount={() => {
          setMiniAppsModalVisible(false);
          navigation.push("AccountManagement");
        }}
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
  topGradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Extends below the buttons (which are at top: 60 with ~40px height)
    zIndex: 1000,
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
