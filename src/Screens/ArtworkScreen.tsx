import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// import { ArtworkView } from "../Components/ArtworkView";
// import { Button } from "../Components/Button";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import { darkGrey } from "../colors";
import { useArtwork } from "../hooks/useArtwork";
import { Title } from "react-native-paper";
import moment from "moment";
import { Video, ResizeMode } from "expo-av";
import Icon, { IconTypes } from "../Components/Icon";
import { useContact } from "../hooks/useContact";
import { ContentView } from "../Components/ContentView";

const ArtworkScreen = ({ navigation, route }) => {
  const [contact] = useContact();
  const [artwork] = useArtwork(route.params.artwork.id);
  const screenWidth = Dimensions.get("window").width;
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (navigation && artwork) {
      navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
        headerRight: () => (
          <>
            {artwork?.data?.collaborators?.includes(contact?.id) && (
              <TouchableOpacity
                onPress={handleAddContent}
                style={{ marginRight: 16 }}
              >
                <Icon
                  type={IconTypes.Ionicons}
                  size={20}
                  color="black"
                  name="cloud-upload-outline"
                />
              </TouchableOpacity>
            )}
          </>
        ),
      });
    }
  }, [navigation, artwork, contact]);

  React.useEffect(() => {
    if (artwork?.data?.image) {
      Image.getSize(artwork.data.image, (width, height) => {
        setImageSize({ width, height });
      }, (error) => {
        console.error("Error getting image size:", error);
      });
    }
  }, [artwork?.data?.image]);

  const handleAddContent = React.useCallback(() => {
    navigation.push("AddContent", {
      artwork,
    });
  }, [artwork, navigation]);

  const handleShowCamera = React.useCallback(() => {
    navigation.push("Camera");
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Artwork Details Header */}
        {artwork?.data?.image && (
          <Image
            source={{ uri: artwork.data.image }}
            style={{
              width: screenWidth,
              height: imageSize.width > 0 
                ? screenWidth * (imageSize.height / imageSize.width) 
                : screenWidth * (artwork.data.height ?? 4) / (artwork.data.width ?? 3) || screenWidth,
              resizeMode: 'contain',
            }}
          />
        )}
        <View style={styles.artworkDetailsContainer}>
          {artwork?.title && <Title style={styles.artworkTitle}>{artwork.title}</Title>}
          {artwork?.description && (
            <Text style={styles.artworkDescription}>{artwork.description}</Text>
          )}
          {artwork?.data?.artist && (
            <Text style={styles.artistName}>
              <Text>Artist: </Text>
              {artwork.data.artist}
            </Text>
          )}
          {artwork?.data?.year && (
            <Text style={styles.artworkYear}>
              <Text>Year: </Text>
              {artwork.data.year}
            </Text>
          )}
          {artwork?.data?.medium && (
            <Text style={styles.artworkMedium}>
              <Text>Medium: </Text>
              {artwork.data.medium}
            </Text>
          )}
        </View>
        
        {(artwork?.content && artwork.content.length > 0) && <View style={{ marginLeft: 16, marginTop: 20 }}>
          <View
            style={{
              height: "100%",
              width: 1,
              position: "absolute",
              backgroundColor: "#85af8e",
              marginTop: 16,
            }}
          />
          <View
            style={{
              backgroundColor: "#85af8e",
              height: 1,
              marginTop: 20.5,
              position: "absolute",
              width: 12,
            }}
          />
          <View
            style={{
              height: 10,
              width: 10,
              position: "absolute",
              backgroundColor: "green",
              marginTop: 16,
              marginLeft: -4.5,
              borderRadius: 8,
            }}
          />
          <View style={{ paddingHorizontal: 16, marginVertical: 4 }}>
            <Title>Artwork Timeline</Title>
          </View>
        </View>}
        {artwork?.content?.map((content, i) => (
          <View
            key={`content-${content.id || i}`}
            style={{
              marginLeft: 16,
            }}
          >
            <View
              style={{
                height: "100%",
                width: i + 1 !== artwork.content.length ? 1 : 0,
                position: "absolute",
                backgroundColor: "#85af8e",
                marginTop: 10,
              }}
            />
            <View
              style={{
                height: 6,
                width: 6,
                position: "absolute",
                backgroundColor: "#aaa",
                marginTop: 9.5,
                marginLeft: -2.5,
                borderRadius: 8,
              }}
            />
            <View
              style={{
                marginTop: 12,
                height: 1,
                backgroundColor: "#aaa",
                marginBottom: -7,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                paddingHorizontal: 4,
                color: "#666",
                backgroundColor: "#eee",
                fontStyle: "italic",
                marginLeft: 12,
              }}
            >
              {moment(content.timestamp).format(
                "dddd MMMM Do, YYYY – h:mm a"
              )}
            </Text>
            <ContentView content={content} />
          </View>
        ))}
      </ScrollView>
      {/* <View style={styles.buttonContainer}>
        <Button
          title="SCAN TO COLLECT"
          variant="solid"
          onPress={handleShowCamera}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#eee",
    borderColor: "#999",
    borderTopWidth: 1,
    paddingBottom: 24,
  },
  artworkDetailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  artworkTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  artworkDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
    lineHeight: 22,
  },
  artistName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  artworkYear: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  artworkMedium: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: "#999",
    borderTopWidth: 1,
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
});

export default ArtworkScreen;
