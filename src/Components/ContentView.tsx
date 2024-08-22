import React from "react";
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";

interface ContentViewProps {
  content: any;
}

export const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const w = Dimensions.get("window").width - 64;

  return (
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
              ((Dimensions.get("window").width - 64) / content.data.width),
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
              ((Dimensions.get("window").width - 64) / content.data.width),
            width: w,
            borderRadius: 4,
            marginBottom: 16,
          }}
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
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
  },
});
