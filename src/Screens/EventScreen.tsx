import React from "react";
import { TouchableOpacity, ScrollView, StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import { RenderHTML } from "../Components/RenderHTML";

import { lightGreen, darkGrey } from "../colors";

const EventScreen = ({ navigation, route }) => {
  const [event, setEvent] = React.useState(route?.params?.event ?? null);

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  React.useEffect(() => {
    (async () => {
      if (event.id) {
        const eventRes = await fetch(
          `https://api.dpop.tech/api/event/${event.slug}`
        );
        const fetchedEvent = await eventRes.json();
        setEvent(fetchedEvent.data);
      }
    })();
  }, []);

  const handleRSVP = React.useCallback(() => {
    if (event.url) {
      Linking.openURL(event.url);
    }
  }, [event]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <EventCard
            event={event}
            options={{ showBookmark: true, showDate: true, showVenue: true }}
          />
        </View>
        {event.content && (
          <RenderHTML html={event.content} style={{ paddingHorizontal: 16 }} />
        )}
      </ScrollView>
      {event.url?.match("http") && (
        <View style={styles.buttonContainer}>
          <Button title="View Details" variant="solid" onPress={handleRSVP} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: "column",
    borderColor: "#999",
    borderTopWidth: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: "#999",
    borderBottomWidth: 1,
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
});

export default EventScreen;
