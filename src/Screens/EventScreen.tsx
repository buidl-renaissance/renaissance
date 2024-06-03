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
import { ChatBox } from "../Components/ChatBox";
import { isAdmin, submitEventComment } from "../dpop";
import { DAComment } from "../interfaces";
import { EventBookmarkButton } from "../Components/EventBookmarkButton";
import { RoundButton } from "../Components/RoundButton";

const EventScreen = ({ navigation, route }) => {
  const [event, setEvent] = React.useState(route?.params?.event ?? null);
  const [comments, setComments] = React.useState<DAComment[]>([]);

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
    headerRight: () => (
      <>
        {true ? (
          <TouchableOpacity
            onPress={handleEdit}
            style={{ marginRight: 16, opacity: 1 }}
          >
            <Icon
              type={IconTypes.Feather}
              size={20}
              color="black"
              name={"edit"}
            />
          </TouchableOpacity>
        ) : null}
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
        setComments(fetchedEvent.data?.comments ?? []);
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

  const handleSubmitComment = React.useCallback(
    (text) => {
      (async () => {
        try {
          const comment = await submitEventComment(event, text);
          const updatedComments = [...event.comments, comment] ?? [comment];
          console.log("comment", comment, event);
          setComments(updatedComments);
        } catch (error) {
          console.log("COMMENT ERR: ", error);
        }
      })();
    },
    [event]
  );

  const handleChatPress = React.useCallback(() => {}, []);

  const handleSharePress = React.useCallback(() => {}, []);

  const imageHeight = event.image_data?.width
    ? (event.image_data?.height / event.image_data?.width) *
      Dimensions.get("window").width
    : 360;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ backgroundColor: "white" }}>
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
        <ChatBox comments={comments} handleSubmit={handleSubmitComment} />
      </ScrollView>
      {/* {event.url && <WebView style={{ flex: 1 }} source={{ uri: event.url }} />} */}

      {event.url?.match("http") && (
        <View style={styles.buttonContainer}>
          {/* <EventBookmarkButton event={event} type="large" />
          <RoundButton
            onPress={handleChatPress}
            type={IconTypes.MaterialIcons}
            name={"chat"}
          />
          <RoundButton
            onPress={handleSharePress}
            type={IconTypes.Ionicons}
            name={"share"}
          /> */}
          <Button title="View Details" variant="solid" onPress={handleRSVP} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
    flexDirection: "column",
    borderColor: "#999",
    borderTopWidth: 1,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
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
