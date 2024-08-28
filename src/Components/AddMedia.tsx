import React from "react";
import { StyleSheet, Image, View, Dimensions, ScrollView } from "react-native";

import { Button } from "./Button";

import { darkGrey } from "../colors";
import { useImagePicker } from "../hooks/useImagePicker";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Video, ResizeMode } from "expo-av";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import { uploadVideo } from "../dpop";
import * as FileSystem from "expo-file-system";

const AddMedia = ({
  onConvertedMedia
}) => {
  const { pickImage, image, uploadedImageUrl } = useImagePicker({
    allowsEditing: false,
  });

  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});
  const [convertedVideoUri, setConvertedVideoUri] = React.useState<
    string | null
  >();

  //   const handleCreate = React.useCallback(() => {
  //     (async () => {
  //       await addContent(uploadedImageUrl);
  //       navigation.goBack();
  //     })();
  //   }, [uploadedImageUrl]);

  React.useEffect(() => {
    (async () => {
      const asset = image?.[0];
      if (asset && !convertedVideoUri) {
        const newFile = asset.uri.replace(".mov", ".mp4");
        await FFmpegKit.execute(`-i ${asset.uri}  -vcodec hevc_videotoolbox -b:v 6000k -tag:v hvc1 -c:a eac3 -b:a 224k ${newFile}`);
        const info = await FileSystem.getInfoAsync(image[0].uri as string);

        console.log("CONVERTED: ", newFile);
        setConvertedVideoUri(newFile);
        const result = await uploadVideo(
          {
            fileName: image[0].fileName,
            type: 'video/mp4',
            uri: newFile,
          },
          info
        );
        console.log("video upload: ", result);
        onConvertedMedia(result);
      }
    })();
  }, [image]);

  if (image) console.log("image exif: ", image[0].exif);

  const w = Dimensions.get("window").width - 32;

  console.log(image ? image[0] : "unknown");

  return (
    <ScrollView
      style={{ padding: 16 }}
      contentContainerStyle={{ paddingBottom: 64 }}
    >
      {image && (
        <TouchableOpacity onPress={pickImage}>
          {image[0].type === "image" && (
            <Image
              source={{ uri: image[0].uri }}
              style={{
                height:
                  image[0].height *
                  (Dimensions.get("window").width / image[0].width),
                width: "100%",
                backgroundColor: "#ddd",
                marginBottom: 32,
              }}
            />
          )}
          {image[0].type === "video" && convertedVideoUri && (
            <Video
              ref={video}
              style={{
                height: image[0].height * (w / image[0].width),
                width: w,
                backgroundColor: "#ddd",
                borderRadius: 4,
                marginBottom: 16,
              }}
              source={{
                uri: convertedVideoUri,
              }}
              isMuted={true}
              volume={1}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
          )}
        </TouchableOpacity>
      )}
      <Button title="Upload Image" variant="hollow" onPress={pickImage} />
    </ScrollView>
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
  input: {
    backgroundColor: "#e5ecf3",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
});

export default AddMedia;
