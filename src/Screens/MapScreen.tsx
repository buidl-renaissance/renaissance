// AIzaSyC692zHU7Xt8x6_cfidxZ0Xbzqz9mP8IvI

import * as React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

import MapView, { Marker } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  Button,
} from "react-native";
import { useRef } from "react";
import { EventCard } from "../Components/EventCard";

const DateRangeSelectorBox = ({}) => {
  const handleDateRange = (range: string) => {
    console.log("SELECT REANGE", range);
  };
  return (
    <View style={styles.dateRangeContainer}>
      <TouchableOpacity
        style={styles.dateTab}
        onPress={() => handleDateRange("this-week")}
      >
        <Text>This Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dateTab}
        onPress={() => handleDateRange("next-week")}
      >
        <Text>Next Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dateTab}
        onPress={() => handleDateRange("select")}
      >
        <Text>Select Date</Text>
      </TouchableOpacity>
    </View>
  );
};

const MapScreen = ({ navigation }) => {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const eventsRes = await fetch(
        "https://detroitartdao.com/wp-json/tribe/events/v1/events?per_page=20&featured=true"
      );
      const fetchedEvents = await eventsRes.json();
      setEvents(fetchedEvents.events);
    })();
  }, []);

  const handlePressEvent = React.useCallback((event) => {
    navigation.push("Event", {
      event,
    });
  }, []);

  const mapRegions = [
    {
      name: "place-one",
      location: {
        latitude: 41.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
    },
    {
      name: "place-one",
      location: {
        latitude: 41.78825,
        longitude: -123.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
    },
    {
      name: "place-one",
      location: {
        latitude: 41.78825,
        longitude: -120.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
    },
    {
      name: "place-one",
      location: {
        latitude: 41.78825,
        longitude: -121.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
    },
  ];
  const mapRef = useRef(null);
  const selectLocation = (region) => {
    if (mapRef.current) {
      mapRef.current?.animateToRegion(region, 1000);
    }
  };
  return (
    <View style={styles.container}>
      <DateRangeSelectorBox />
      <MapView ref={mapRef} style={styles.map}>
        {mapRegions.map((r, index) => (
          <Marker
            coordinate={r.location}
            key={r.location.longitude.toString()}
            title="Marker"
          />
        ))}
      </MapView>
      <View style={styles.mapContainer}>
        <FlatList
          data={events}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity onPress={() => handlePressEvent(item)}>
                <EventCard event={item} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    height: Dimensions.get("window").height - 500,
    width: Dimensions.get("window").width,
    backgroundColor: "white",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  dateTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateRangeContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    zIndex: 100,
    backgroundColor: "white",
    // height: Dimensions.get("window").height - 500,
    width: Dimensions.get("window").width,
    flexDirection: "row",
  },
  map: {
    // flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
