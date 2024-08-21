import React from "react";
import { StyleSheet, Image, View, Dimensions } from "react-native";

import { Button } from "./Button";

import { darkGrey } from "../colors";
import { useImagePicker } from "../hooks/useImagePicker";
import { TouchableOpacity } from "react-native-gesture-handler";

const AddMedia = () => {
  const { pickImage, image, uploadedImageUrl } = useImagePicker({
    allowsEditing: false,
  });

  //   const handleCreate = React.useCallback(() => {
  //     (async () => {
  //       await addContent(uploadedImageUrl);
  //       navigation.goBack();
  //     })();
  //   }, [uploadedImageUrl]);

  if (image) console.log("image exif: ", image[0].exif);

  return (
    <View style={{ padding: 16 }}>
      {!image && (
        <Button title="Upload Image" variant="hollow" onPress={pickImage} />
      )}
      {image && (
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: image[0].uri }}
            style={{
              height:
                image[0].height *
                (Dimensions.get("window").width / image[0].width),
              width: "100%",
              marginBottom: 32,
            }}
          />
        </TouchableOpacity>
      )}
    </View>
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
