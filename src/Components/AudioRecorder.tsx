import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  View,
  ScrollView,
} from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { createContent, DAUpload, uploadAudioUri, uploadImage } from "../dpop";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import moment from "moment";
import { updateContent } from "../hooks/useArtwork";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IconTypes } from "../Components/Icon";

export const AudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [audioLevel, setAudioLevel] = useState<number>(0); // Represents the input level of audio
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Time in seconds
  const intervalRef = React.useRef(null);
  const animation = React.useRef(new Animated.Value(1)).current; // For the visual animation

  const [permission, requestPermission] = useCameraPermissions();

  const [photo, setPhoto] = useState();
  const [upload, setUpload] = useState<DAUpload>();

  const [media, setMedia] = useState<DAUpload[]>([]);
  const [photos, setPhotos] = useState<{ uri: string; elapsedTime: number }[]>(
    []
  );
  const [camera, setCamera] = React.useState();

  // Update elapsed time every second
  React.useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current ?? 0);
    }
    return () => clearInterval(intervalRef.current ?? 0);
  }, [isRecording]);

  const flipCamera = React.useCallback(() => {
    setFacing(facing === "back" ? "front" : "back");
  }, [facing]);

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);

      setIsRecording(true);
      setElapsedTime(0);

      recording.setProgressUpdateInterval(100);

      // Monitor input levels for the visualization
      recording.setOnRecordingStatusUpdate((status) => {
        setAudioLevel(status.metering ?? 0);
        if (status.metering) {
          animatePulse(status.metering);
        }
      });

      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setIsRecording(false);
    setRecording(undefined);
    const duration = elapsedTime;
    setElapsedTime(0);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    console.log("Recording stopped and stored at", uri);

    // Send the recorded audio to the server
    const result = await uploadAudioUri(uri);

    const firstMedia = media.length > 0 ? media[0] : upload;

    await createContent({
      artwork: 1,
      caption: "text",
      data: {
        height: firstMedia?.height ?? 1920,
        type: "audio",
        image: firstMedia?.url,
        audio: result.url,
        width: firstMedia?.width ?? 1080,
        media: media,
        duration: duration, // Add duration to the saved audio file
      },
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    updateContent();
    setPhoto(undefined);
    setMedia([]);
    setPhotos([]);
  }

  // Animate the pulsing circle based on audio level
  function animatePulse(level) {
    console.log("LEVEL: ", level);
    const scale = Math.max(1, 1 + Math.abs(level) / 160); // Normalize dB values to a usable scale
    Animated.timing(animation, {
      toValue: scale,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  const takePicture = React.useCallback(() => {
    console.log("TAKE Picture", camera);
    if (camera) {
      camera.takePictureAsync({ onPictureSaved: onPictureSaved });
      if (!isRecording) {
        startRecording();
      }
    }
  }, [camera, isRecording, startRecording]);

  const onPictureSaved = React.useCallback(
    async (photo) => {
      console.log(photo);
      photo.fileName = "cover.jpeg";
      photo.type = "image";
      setPhoto(photo);

      setPhotos([...photos, { uri: photo.uri, elapsedTime }]);

      setTimeout(() => {
        setPhoto(undefined);
      }, 1000);

      const upload = await uploadImage({
        uri: photo.uri,
        fileName: photo.fileName,
        type: photo.type,
        elapsedTime,
      });

      upload.elapsedTime = elapsedTime;
      setUpload(upload);
      setMedia([...media, upload]);
      console.log("image upload: ", upload);
    },
    [
      camera,
      isRecording,
      elapsedTime,
      media,
      upload,
      photo,
      setUpload,
      setMedia,
      setPhoto,
      startRecording,
    ]
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{ width: "100%", height: Dimensions.get("window").height - 200 }}
      >
        {!photo && (
          <CameraView
            autofocus="on"
            facing={facing}
            style={styles.camera}
            ref={(ref) => {
              setCamera(ref);
            }}
          >
            <View style={{ position: "absolute", top: 10, left: 10 }}>
              <TouchableOpacity onPress={flipCamera}>
                <Icon
                  type={IconTypes.Ionicons}
                  size={36}
                  color="white"
                  name="camera-reverse"
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 15,
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <TouchableOpacity onPress={takePicture}>
                <View
                  style={{
                    padding: 10,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: "white",
                  }}
                >
                  <Icon
                    type={IconTypes.Ionicons}
                    size={36}
                    color="white"
                    name="camera"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
        {photo && (
          <Image
            source={{ uri: photo.uri }}
            style={{
              height: Dimensions.get("window").height - 200,
              width: "100%",
              backgroundColor: "#ddd",
              marginBottom: 32,
            }}
          />
        )}
      </View>

      <ScrollView horizontal={true} style={styles.imageTileContainer}>
        {photos.map((item, index) => (
          <View key={index} style={styles.imageTile}>
            <Image source={{ uri: item.uri }} style={styles.tileImage} />
            <Text style={styles.tileText}>{item.elapsedTime}s</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Animated.View
            style={[
              styles.recordButton,
              isRecording && { transform: [{ scale: animation }] },
            ]}
          >
            <Icon
              type={IconTypes.Ionicons}
              size={36}
              color="white"
              name={isRecording ? "radio-button-on" : "mic"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 16,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timer: {
    fontSize: 18,
    marginBottom: 20,
  },
  recordButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6347",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  imageTileContainer: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  imageTile: {
    marginRight: 10,
    alignItems: "center",
  },
  tileImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  tileText: {
    marginTop: 5,
    fontSize: 12,
  },
});
