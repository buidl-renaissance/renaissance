import React from "react";
import { ScrollView, StyleSheet, Image, View, Dimensions } from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { Button } from "../Components/Button";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { createFlyer } from "../dpop";

import { lightGreen, darkGrey } from "../colors";
import { useImagePicker } from "../hooks/useImagePicker";
import { TouchableOpacity } from "react-native-gesture-handler";

const CreateFlyerScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const { pickImage, image, uploadedImageUrl } = useImagePicker({
    allowsEditing: false,
  });

  const handleCreate = React.useCallback(() => {
    (async () => {
      await createFlyer(uploadedImageUrl);
      navigation.goBack();
    })();
  }, [uploadedImageUrl]);

  if (image) console.log("image exif: ", image[0].exif);

  return (
    <AutocompleteDropdownContextProvider headerOffset={88}>
      <View style={styles.container}>
        <ScrollView style={{ padding: 16 }}>
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
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button title="Submit Flyer" variant="solid" onPress={handleCreate} />
        </View>
      </View>
    </AutocompleteDropdownContextProvider>
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

export default CreateFlyerScreen;
