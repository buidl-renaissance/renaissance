import React from "react";
import { StyleSheet, Image, View, Text, Dimensions, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import YoutubePlayer from "react-native-youtube-iframe";
import { RoundButton } from "./RoundButton";
import { IconTypes } from "./Icon";
import { Audio, } from 'expo-av';

interface ContentViewProps {
  content: any;
}

export const ContentView: React.FC<ContentViewProps> = ({ content }) => {
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

  const togglePlaying = React.useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  async function playSound() {
    console.log('Loading Sound');

    console.log('uri', content);

    const { sound } = await Audio.Sound.createAsync({ uri: content.data.audio });

    console.log('Playing Sound');
    await sound.playAsync();
    // console.log('Stop Sound');
    // await sound.stopAsync();
    // console.log('Unload Sound');
    // await sound.unloadAsync();
  }

  return (
    <View style={{ marginTop: 8, paddingHorizontal: 16, marginBottom: 16 }}>
      {content.caption?.length > 0 && (
        <Text style={{ marginBottom: 8 }}>{content.caption}</Text>
      )}
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
            marginBottom: 8,
          }}
        />
      )}
      {content.data.type === "audio" && (
        <TouchableOpacity onPress={playSound}>
          <Image
            source={{
              uri: content.data.image,
            }}
            style={{
              height:
                content.data.height *
                ((Dimensions.get("window").width - 64) / content.data.width),
              width: w,
              borderRadius: 4,
              resizeMode: "cover",
              marginBottom: 8,
            }}
          />
        </TouchableOpacity>

      )}
      {content.data.type === "youtube" && (
        <YoutubePlayer
          height={200}
          play={playing}
          videoId={content.data.youtubeId}
          onChangeState={onStateChange}
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
  },
  subtitle: {
    fontSize: 14,
  },
});
