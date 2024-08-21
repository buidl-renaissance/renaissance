import React from "react";
import {
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
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

const ArtworkScreen = ({ navigation, route }) => {
  const [contact] = useContact();

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
    headerRight: () => (
      <>
        {artwork?.data.collaborators.includes(contact?.id) && (
          <TouchableOpacity
            onPress={handleAddContent}
            style={{ marginRight: 16 }}
          >
            <Icon
              type={IconTypes.Ionicons}
              size={20}
              color="black"
              name={"cloud-upload-outline"}
            />
          </TouchableOpacity>
        )}
      </>
    ),
  });

  const handleAddContent = React.useCallback(() => {
    navigation.push("AddContent", {
      artwork,
    });
  }, []);

  const handleShowCamera = React.useCallback(() => {
    navigation.push("Camera");
  }, []);

  // getArtwork
  const [artwork] = useArtwork(route.params.artwork.id);

  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ marginLeft: 16 }}>
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
            {artwork?.title && <Title>{artwork?.title}</Title>}
          </View>
        </View>
        {artwork?.content.map((content, i: number) => {
          const w = Dimensions.get("window").width - 64;
          return (
            <View
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
              <View style={{ marginTop: 8, paddingHorizontal: 16 }}>
                {/* <View style={{ marginVertical: 4 }}>
                  {true && (
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        fontSize: 10,
                      }}
                    >
                      {content.artwork?.title}
                    </Text>
                  )}
                </View> */}
                {content.data.type === "image/jpeg" && (
                  <Image
                    source={{
                      uri: content.data.url,
                    }}
                    style={{
                      height:
                        content.data.height *
                        ((Dimensions.get("window").width - 64) /
                          content.data.width),
                      width: w,
                      borderRadius: 4,
                      resizeMode: "cover",
                      marginBottom: 16,
                    }}
                  />
                )}
                {content.data.type === "video/mp4" && (
                  <Video
                    ref={video}
                    style={{
                      height:
                        content.data.height *
                        ((Dimensions.get("window").width - 64) /
                          content.data.width),
                      width: w,
                      borderRadius: 4,
                      marginBottom: 16,
                    }}
                    shouldPlay={true}
                    source={{
                      uri: content.data.url,
                    }}
                    isMuted={true}
                    volume={1}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                  />
                )}
              </View>
            </View>
          );
        })}
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
