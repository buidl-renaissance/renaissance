import React from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  View,
  Text,
  ScrollView,
} from "react-native";
import { useAudioPlayer } from "../../context/AudioPlayer";
import moment from "moment";

interface AudioViewProps {
  content: {
    data: {
      audio: string;
      image: string;
      height: number;
      width: number;
      media?: Array<{ url: string; elapsedTime: number }>;
      duration?: number;
    };
    timestamp?: string;
  };
}

const AudioView: React.FC<AudioViewProps> = ({ content }) => {
  const { currentUri, playSound, elapsedTime, seekToTime, isPlaying, stopSound } =
    useAudioPlayer();
  const w = Dimensions.get("window").width - 64;

  const play = React.useCallback(async () => {
    await playSound(content.data.audio);
  }, [content.data.audio, playSound]);

  const getCurrentImage = React.useCallback(() => {
    if (
      currentUri === content.data.audio &&
      content.data.media &&
      content.data.media.length > 1
    ) {
      let uri = content.data.image;
      for (let i = 0; i < content.data.media.length; i++) {
        if (content.data.media[i].elapsedTime <= elapsedTime) {
          uri = content.data.media[i].url;
        }
      }
      return uri;
    }
    return content.data.image;
  }, [currentUri, content.data, elapsedTime]);

  const handleTilePress = React.useCallback(
    (time: number) => {
      seekToTime(content.data.audio, time);
    },
    [seekToTime, playSound, content.data.audio, isPlaying]
  );

  const isThisAudioPlaying = currentUri === content.data.audio && isPlaying;

  return (
    <View>
      <TouchableOpacity onPress={isThisAudioPlaying ? stopSound : play}>
        <Image
          source={{ uri: getCurrentImage()?.replace("/uploads", "/uploads/resized/800w") }}
          style={[
            styles.image,
            {
              height: content.data.height * (w / content.data.width),
              width: w,
            },
          ]}
        />
        <Text style={styles.elapsedTimeText}>
          {isThisAudioPlaying
            ? `${formatTime(elapsedTime)} / ${formatTime(
                content.data.duration || 0
              )}`
            : "Tap to play"}
        </Text>
      </TouchableOpacity>
      {content.data.media && content.data.media.length > 1 && (
        <ScrollView horizontal style={styles.tileContainer}>
          {content.data.media.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleTilePress(item.elapsedTime)}
            >
              <View style={styles.tile}>
                <Image source={{ uri: item.url?.replace("/uploads", "/uploads/resized/tiles") }} style={styles.tileImage} />
                <Text style={styles.tileText}>
                  {formatTime(item.elapsedTime)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 4,
    resizeMode: "cover",
    marginBottom: 8,
  },
  elapsedTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  tileContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  tile: {
    marginRight: 10,
    alignItems: "center",
  },
  tileImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  tileText: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default AudioView;
