import React from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  View,
  Dimensions,
  Text,
} from "react-native";
import * as Linking from "expo-linking";
import Icon, { IconTypes } from "../Components/Icon";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import { RenderHTML } from "../Components/RenderHTML";

import QRCode from "react-qr-code";
import { useContent } from "../hooks/useArtwork";
import { theme } from "../colors";
import { ContentView } from "../Components/ContentView";

const EventScreen = ({ navigation, route }) => {
  const [event, setEvent] = React.useState(route?.params?.event ?? null);
  const [content] = useContent(`event-${event?.slug}`);

  const handleEdit = React.useCallback(() => {
    navigation.push("EventEdit", {
      event,
    });
  }, [event, navigation]);

  React.useEffect(() => {
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
                color={theme.text}
                name={"edit"}
              />
            </TouchableOpacity>
          ) : null}
        </>
      ),
    });
  }, [navigation, handleEdit]);

  React.useEffect(() => {
    (async () => {
      if (event?.id) {
        const eventRes = await fetch(
          `https://api.detroiter.network/api/event/${event.slug}`
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



  const imageHeight = event.image_data?.width
    ? (event.image_data?.height / event.image_data?.width) *
    Dimensions.get("window").width
    : 360;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          <EventCard
            event={event}
            options={{ showBookmark: true, showDate: true, showVenue: true }}
          />
        </View>
        {event.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: event.image,
              }}
              style={[styles.eventImage, { height: imageHeight }]}
            />
          </View>
        )}
        {event.content && (
          <View style={styles.contentContainer}>
            <RenderHTML html={event.content} style={styles.htmlContent} />
          </View>
        )}
        {content && content.length > 0 && (
          <View style={styles.contentSection}>
            {content.map((item, index) => (
              <ContentView key={index} content={item} />
            ))}
          </View>
        )}
        <View style={styles.qrContainer}>
          <Text style={styles.qrLabel}>Event QR Code</Text>
          <QRCode
            value={`https://dpop.tech/event/${event.slug}`}
            size={Dimensions.get("window").width - 96}
            style={styles.qrCode}
          />
        </View>
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
    backgroundColor: theme.inputBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: theme.surface,
    marginBottom: 1,
  },
  imageContainer: {
    backgroundColor: theme.surface,
    marginBottom: 1,
  },
  eventImage: {
    width: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    backgroundColor: theme.surface,
    paddingVertical: 20,
    marginBottom: 1,
  },
  htmlContent: {
    paddingHorizontal: 16,
  },
  contentSection: {
    backgroundColor: theme.surface,
    paddingVertical: 16,
    marginBottom: 1,
  },
  qrContainer: {
    backgroundColor: theme.surface,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 20,
    textAlign: "center",
  },
  qrCode: {
    padding: 16,
    backgroundColor: theme.surface,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default EventScreen;
