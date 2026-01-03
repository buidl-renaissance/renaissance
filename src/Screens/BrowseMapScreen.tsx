import React from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapView, {
  Marker,
  MapMarker,
  Region,
  MarkerPressEvent,
} from "react-native-maps";
import { theme } from "../colors";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import { DAEvent, DAVenue } from "../interfaces";

import VenuePopup from "../Components/VenuePopup";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const BrowseMapScreen = ({ navigation }) => {
  const [events, setEvents] = React.useState([]);
  const [selectedVenue, setSelectedVenue] = React.useState<DAVenue | null>(
    null
  );

  const [currentCallout, setCurrentCallout] = React.useState<number | null>(
    null
  );

  const venueListRef = React.useRef<FlatList>(null);
  const mapViewRef = React.useRef<MapView>(null);
  const markerRefs = React.useRef<MapMarker[]>(null);
  // const carouselRef = React.useRef<typeof Carousel<any>>(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const [region, setRegion] = React.useState<Region>({
    latitude: 42.3498284,
    longitude: -83.0329842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [lastRegion, setLastRegion] = React.useState<Region>(region);

  const [venues, setVenues] = React.useState<DAVenue[]>([]);
  const mapRef = React.useRef(null);

  navigation.setOptions({
    title: 'Map',
    headerTitle: () => <HeaderTitleImage />,
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

  React.useEffect(() => {
    (async () => {
      const eventsRes = await fetch("https://api.detroiter.network/api/events");
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.data);
    })();
  }, []);

  React.useEffect(() => {
    const results = {};
    const uniqueVenues: DAVenue[] = [];
    events.map((event: DAEvent) => {
      if (event.venue) {
        if (!results[event.venue.slug]) {
          const eventVenue = event.venue;
          eventVenue.events = [event];
          results[event.venue.slug] = eventVenue;
          uniqueVenues.push(eventVenue);
        } else {
          results[event.venue.slug].events.push(event);
        }
      }
    });
    console.log("LOAD VENUES");
    // console.log("uniqueVenues: ", uniqueVenues.map(v => v.slug))
    // console.log("uniqueVenues: ", uniqueVenues)
    setVenues(uniqueVenues);
  }, [events]);

  const selectLocation = (region) => {
    if (mapRef.current) {
      mapRef.current?.animateToRegion(region, 1000);
    }
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: ITEM_LENGTH,
    offset: ITEM_LENGTH * (index - 1),
    index,
  });

  const getVenueWithSlug = (venues, slug: string) => {
    let match: DAVenue | null = null;
    venues.map((venue) => {
      if (venue.slug === slug) {
        match = venue;
      }
    });
    return match;
  };

  const handleMarkerPress = React.useCallback(
    (e: MarkerPressEvent) => {
      const coordinate = e.nativeEvent.coordinate;
      const v = getVenueWithSlug(venues, e.nativeEvent.id);
      // console.log(e.nativeEvent.id, v?.venue)
      if (v) {
        setSelectedVenue(v);
        const index = venues.indexOf(v);
        // console.log(e.nativeEvent.id, index,  - width + 40)
        setCurrentCallout(index);
        venueListRef.current?.scrollToOffset({
          animated: true,
          offset: index * ITEM_LENGTH,
        });
      }
      mapViewRef.current?.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: lastRegion.latitudeDelta,
        longitudeDelta: lastRegion.longitudeDelta,
      });
    },
    [venues, lastRegion]
  );

  const updateSelectedCallout = React.useCallback(
    (index: number) => {
      // console.log("updateSelectedCallout: ", currentCallout !== index)
      if (currentCallout !== index) {
        markerRefs[index].showCallout();
        setCurrentCallout(index);
      }
    },
    [currentCallout, markerRefs]
  );

  const onSelectEvent = React.useCallback((event: DAEvent) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  return (
    <View style={styles.map}>
      <MapView
        loadingEnabled={true}
        style={styles.map}
        ref={mapViewRef}
        region={region}
        mapPadding={{
          top: 0,
          bottom: selectedVenue ? 330 : 0,
          // bottom: 180,
          right: 0,
          left: 0,
        }}
        onRegionChange={(region) => {
          setLastRegion(region);
        }}
        onMarkerPress={handleMarkerPress}
      >
        {venues.map((venue: DAVenue, index) => (
          <Marker
            identifier={venue.slug}
            ref={(ref) => (markerRefs[index] = ref)}
            key={venue.slug}
            coordinate={{
              latitude: venue.geo?.lat,
              longitude: venue.geo?.lng,
            }}
            title={venue.venue}
            description={venue.address}
          >
            <View
              style={{
                backgroundColor: selectedVenue?.id === venue.id ? "#333" : "#ddd",
                borderColor: theme.border,
                borderWidth: 1,
                width: 24,
                height: 24,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: selectedVenue?.id === venue.id ? "white" : "black",
                  textAlign: "center",
                  fontSize: 16,
                  padding: 2,
                }}
              >
                {venue.events?.length}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <VenuePopup venue={selectedVenue} onSelectEvent={onSelectEvent} onClose={() => setSelectedVenue(null)} />
      {/* <FlatList
        style={styles.venueContainer}
        ref={venueListRef}
        renderItem={({ item, index }: { item: DAVenue; index: number }) => {
          return (
            <View style={{ width: ITEM_LENGTH }}>
              <Animated.View
                style={[
                  {
                    height: 220,
                  },
                ]}
              >
                <View style={styles.cardContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.events?.length && (
                    <Text>{item.events?.length} upcoming events</Text>
                  )}
                  <View style={{ marginHorizontal: -4 }}>
                    {item.events?.map((event: DAEvent) => {
                      return (
                        <EventCard
                          event={event}
                          options={{ showDate: true, showVenue: false }}
                        />
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            </View>
          );
        }}
        data={venues}
        horizontal
        showsHorizontalScrollIndicator={false}
        // keyExtractor={(item) => item.id}
        keyExtractor={(item) => item.slug}
        getItemLayout={getItemLayout}
        bounces={true}
        bouncesZoom={false}
        decelerationRate={0}
        renderToHardwareTextureAndroid
        contentContainerStyle={styles.flatListContent}
        snapToInterval={ITEM_LENGTH}
        snapToAlignment="start"
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.floor(
            (e.nativeEvent.contentOffset.x + 80) / ITEM_LENGTH
          );
          // console.log("on momementum: ", index, currentCallout, e.nativeEvent.contentOffset.x),
          updateSelectedCallout(index);
        }}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          return Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          );
        }}
      /> */}
    </View>
  );
};

export default BrowseMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    flexDirection: "column",
    borderTopWidth: 1,
    borderColor: "#999",
  },
  cardContainer: {
    backgroundColor: theme.background,
    // backgroundColor: '#d2e4dd',
    height: 180,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: theme.border,
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
