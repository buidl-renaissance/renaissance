import React from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MapView, { Marker, MapMarker, Region, MarkerPressEvent } from 'react-native-maps'

import { EventCard } from '../Components/EventCard';
import Icon, { IconTypes } from '../Components/Icon';
import { HeaderTitleImage } from '../Components/HeaderTitleImage';

import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

type DisplayType = 'list' | 'map';

interface DAVenue {
    id: number; // 583,
    author: string; // "2",
    status: string; // "publish",
    date: string; // "2022-09-18 16:45:53",
    date_utc: string; // "2022-09-18 16:45:53",
    modified: string; // "2022-09-18 16:45:53",
    modified_utc: string; // "2022-09-18 16:45:53",
    url: string; // "https://detroitartdao.com/venue/detroit-vineyards",
    venue: string; // "Detroit Vineyards",
    slug: string; // "detroit-vineyards",
    address: string; // "1000 Gratiot Ave",
    city: string; // "Detroit",
    country: string; // "United States",
    state: string; // "MI",
    zip: string; // "48207",
    stateprovince: string; // "MI",
    geo_lat: number; // 42.3406527,
    geo_lng: number; // -83.0401141,
    show_map: boolean; // true,
    show_map_link: boolean; // true
    events?: DAEvent[];
}

interface DAEvent {
    venue: DAVenue;
}

/**
 * Returns a memoized function that will only call the passed function when it hasn't been called for the wait period
 * @param func The function to be called
 * @param wait Wait period after function hasn't been called for
 * @returns A memoized function that is debounced
 */
 const useDebouncedCallback = (func, wait) => {
    // Use a ref to store the timeout between renders
    // and prevent changes to it from causing re-renders
    const timeout = React.useRef();
  
    return React.useCallback(
      (...args) => {
        const later = () => {
          clearTimeout(timeout.current);
          func(...args);
        };
  
        clearTimeout(timeout.current);
        timeout.current = setTimeout(later, wait);
      },
      [func, wait]
    );
  };

const CalendarScreen = ({
    navigation
}) => {

    const [ events, setEvents ] = React.useState<DAEvent[]>([]);
    const [ display, setDisplay ] = React.useState<DisplayType>('list');
    const [ currentCallout, setCurrentCallout ] = React.useState<number | null>(null);
    const [ image, setImage ] = React.useState<string | null>(null);

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

    navigation.setOptions({
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

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };

    const handleToggleDisplay = React.useCallback(() => {
        setDisplay(display === 'map' ? 'list' : 'map');
        setRegion(lastRegion);
    }, [setDisplay, display, lastRegion, region]);

    React.useEffect(() => {
        (async () => {
            const eventsRes = await fetch('https://api.dpop.tech/api/events');
            const fetchedEvents = await eventsRes.json();
            setEvents(fetchedEvents.data);
        })();
    }, []);

    React.useEffect(() => {
        const results = {};
        const uniqueVenues: DAVenue[] = [];
        events.map((event: DAEvent) => {
            if (!results[event.venue.slug]) {
                const eventVenue = event.venue;
                eventVenue.events = [event];
                results[event.venue.slug] = eventVenue;
                uniqueVenues.push(eventVenue);
            } else {
                results[event.venue.slug].events.push(event);
            }
        });
        // console.log("uniqueVenues: ", uniqueVenues.map(v => v.slug))
        setVenues(uniqueVenues);
    }, [events]);

    const handlePressEvent = React.useCallback((event) => {
        navigation.push('Event', {
            event,
        });
    }, []);

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

    const handleMarkerPress = React.useCallback((e: MarkerPressEvent) => {
        const coordinate = e.nativeEvent.coordinate;
        const v = getVenueWithSlug(venues, e.nativeEvent.id);
        // console.log(e.nativeEvent.id, v?.venue)
        if (v) {
            const index = venues.indexOf(v);
            // console.log(e.nativeEvent.id, index,  - width + 40)
            setCurrentCallout(index);
            venueListRef.current?.scrollToOffset({
                animated: true,
                offset: index * ITEM_LENGTH,
            })
        }
        mapViewRef.current?.animateToRegion({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: lastRegion.latitudeDelta,
            longitudeDelta: lastRegion.longitudeDelta,
        });
    }, [venues, lastRegion]);

    // const updateSelectedCallout = useDebouncedCallback((index: number) => {
    //     if (currentCallout !== index) {
    //         markerRefs[index].showCallout();
    //         setCurrentCallout(index);
    //     }
    // }, 100); //, [ currentCallout, markerRefs ]);
    const updateSelectedCallout = React.useCallback((index: number) => {
        // console.log("updateSelectedCallout: ", currentCallout !== index)
        if (currentCallout !== index) {
            markerRefs[index].showCallout();
            setCurrentCallout(index);
        }
    }, [ currentCallout, markerRefs ]);

    return (
        <View style={styles.container}>
            {display === 'list' ? (
                <FlatList
                    data={events}
                    ListHeaderComponent={(
                        <ImageBackground source={require('../../assets/renaissance.png')} resizeMode="cover">
                            <View style={{ paddingTop: 360, paddingHorizontal: 16, paddingVertical: 54, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderBottomColor: 'gray', borderBottomWidth: 1 }}>
                                <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', textAlign: 'left', marginTop: 8 }}>Welcome to the Renaissance City</Text>
                                <Text style={{ color: 'white', fontSize: 16, textAlign: 'left', marginVertical: 4 }}>Unlock the rich tapestry of food, arts, and events that Detroit has to offer.</Text>
                            </View>
                        </ImageBackground>
                    )}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity onPress={() => handlePressEvent(item)}>
                                <EventCard event={item} />
                            </TouchableOpacity>
                        )
                    }}
                />
            ) : (
                <View style={styles.map}>
                    <MapView
                        loadingEnabled={true}
                        style={styles.map}
                        ref={mapViewRef}
                        region={region}
                        mapPadding={{ 
                            top: 0,
                            bottom: 180,
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
                                ref={(ref) => markerRefs[index] = ref}
                                key={venue.slug}
                                coordinate={{ latitude: venue.geo_lat, longitude: venue.geo_lng }}
                                title={venue.venue}
                                description={venue.address} />
                        ))}
                    </MapView>
                    <FlatList
                        style={styles.venueContainer}
                        ref={venueListRef}
                        renderItem={({ item, index }: { item: DAVenue, index: number }) => {
                            return (
                                <View style={{ width: ITEM_LENGTH, }}>
                                    <Animated.View
                                        style={[
                                            {
                                                height: 220,
                                            }
                                        ]}>
                                        <View style={styles.cardContainer}>
                                            {/* <EventCard event={item}/> */}
                                            <Text style={styles.title}>{item.venue}</Text>
                                            {item.events?.length && <Text>{item.events?.length} upcoming events</Text>}
                                        </View>
                                    </Animated.View>
                                </View>
                            );
                        }}
                        data={venues}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // keyExtractor={(item) => item.id}
                        keyExtractor={item => item.slug}
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
                            const index = Math.floor((e.nativeEvent.contentOffset.x + 80) / ITEM_LENGTH);
                            // console.log("on momementum: ", index, currentCallout, e.nativeEvent.contentOffset.x), 
                            updateSelectedCallout(index);
                        }}
                        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                            return Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                { useNativeDriver: false },
                            )
                        }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        flexDirection: 'column',
        borderTopWidth: 1,
        borderColor: '#999',
    },
    cardContainer: {
        backgroundColor: 'white',
        // backgroundColor: '#d2e4dd',
        height: 180,
        margin: 8,
        padding: 16,
        borderRadius: 12,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
    },
    venueContainer: {
        flex: 1,
        position: 'absolute',
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
    slide: {

    },
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
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: BORDER_RADIUS + SPACING * 2,
        height: 220,
    },
});

export default CalendarScreen;