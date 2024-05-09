import React from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  View,
  Dimensions,
} from "react-native";
// import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import Icon, { IconTypes } from "../Components/Icon";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import { RenderHTML } from "../Components/RenderHTML";

import { lightGreen, darkGrey } from "../colors";

const EventScreen = ({ navigation, route }) => {
  const [event, setEvent] = React.useState(route?.params?.event ?? null);

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
    headerRight: () => (
      <>
        <TouchableOpacity
          onPress={handleEdit}
          style={{ marginRight: 16, opacity: 0 }}
        >
          <Icon
            type={IconTypes.Ionicons}
            size={20}
            color="black"
            name={"edit"}
          />
        </TouchableOpacity>
      </>
    ),
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

  const handleEdit = React.useCallback(() => {
    navigation.push("EventEdit", {
      event,
    });
  }, [event]);

  const handleRSVP = React.useCallback(() => {
    if (event.url) {
      Linking.openURL(event.url);
    }
  }, [event]);

  const imageHeight = event.image_data?.width
    ? (event.image_data?.height / event.image_data?.width) *
      Dimensions.get("window").width
    : 360;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <EventCard
            event={event}
            options={{ showBookmark: true, showDate: true, showVenue: true }}
          />
        </View>
        {event.image && (
          <View>
            <Image
              source={{
                uri: event.image,
              }}
              style={{
                height: imageHeight ?? 360,
                width: "100%",
                resizeMode: "cover",
              }}
            />
          </View>
        )}
        {event.content && (
          <RenderHTML html={event.content} style={{ padding: 16 }} />
        )}
      </ScrollView>
      {/* {event.url && <WebView style={{ flex: 1 }} source={{ uri: event.url }} />} */}

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
    backgroundColor: "white",
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
