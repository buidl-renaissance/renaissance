import React from "react";
import { StyleSheet, Image, View, Text, Dimensions, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import YoutubePlayer from "react-native-youtube-iframe";
import { useAudioPlayer } from '../context/AudioPlayer';
import AudioView from "./Content/AudioView";
import moment from "moment";
import { theme } from "../colors";

interface ContentViewProps {
  content: any;
}

export const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  const { currentUri, playSound, stopSound, elapsedTime } = useAudioPlayer();
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const w = Dimensions.get("window").width - 64;
  const [playing, setPlaying] = React.useState(false);

  const handleCommentPress = React.useCallback(() => {
    console.log("ADD COMMENT");
  }, []);

  const onStateChange = React.useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  // Format timestamp safely to prevent malformed calls from JS
  const formatTimestamp = React.useCallback((timestamp) => {
    try {
      return moment(timestamp).format("MMMM D, YYYY [at] h:mm A");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  }, []);

  return (
    <View style={{ marginTop: 8, paddingHorizontal: 16, marginBottom: 16 }}>
      {content.timestamp && (
        <Text style={styles.timestamp}>
          {formatTimestamp(content.timestamp)}
        </Text>
      )}
      {content.caption?.length > 0 && (
        <Text style={styles.caption}>{content.caption}</Text>
      )}
      {content.data?.type === "image/jpeg" && content.data?.url && (
        <Image
          source={{
            uri: content.data.url.replace("/uploads", "/uploads/resized/800w"),
          }}
          style={{
            height:
              (content.data.height ?? 4) *
              ((Dimensions.get("window").width - 64) / (content.data.width ?? 3)),
            width: w,
            borderRadius: 4,
            resizeMode: "cover",
            marginBottom: 8,
          }}
        />
      )}
      {content.data?.type === "audio" && (
        <AudioView content={content} />
      )}
      {content.data?.type === "youtube" && content.data?.youtubeId && (
        <YoutubePlayer
          height={200}
          play={playing}
          videoId={content.data.youtubeId}
          onChangeState={onStateChange}
        />
      )}
      {content.data?.type === "video/mp4" && content.data?.url && (
        <Video
          ref={video}
          style={{
            height:
              (content.data.height ?? 4) *
              ((Dimensions.get("window").width - 64) / (content.data.width ?? 3)),
            width: w,
            borderRadius: 4,
            marginBottom: 8,
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
      {/* <View style={{ flex: 1, flexDirection: "row" }}>
        <RoundButton
          color="#666"
          onPress={handleCommentPress}
          type={IconTypes.Ionicons}
          name={"heart-outline"}
        />
        <RoundButton
          color="#666"
          onPress={handleCommentPress}
          type={IconTypes.Ionicons}
          name={"chatbubble-outline"}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: theme.text,
  },
  subtitle: {
    fontSize: 22,
    color: theme.text,
  },
  caption: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
});
