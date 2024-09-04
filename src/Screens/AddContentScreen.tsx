import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { darkGrey } from "../colors";
import AddMedia from "../Components/AddMedia";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { TextInput } from "../Components/Styled/TextInput";
import { Button } from "../Components/Button";
import moment from "moment";
import { createContent } from "../dpop";

const AddContentScreen = ({ navigation, route }) => {
  const [artwork] = React.useState(route?.params?.artwork ?? null);
  const [text, setText] = React.useState<string>("");
  const [media, setMedia] = React.useState<any>();

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const handleAddContent = React.useCallback(() => {
    (async () => {
      const result = await createContent(text, moment(media?.exif.modificationTime * 1000).format("YYYY-MM-DD HH:mm:ss"), media?.url, artwork?.id ?? 1, media?.width ?? 1080, media?.height ?? 1920);
      console.log("result", result);
    })();
  }, [text, media, artwork]);

  return (
    <View style={styles.container}>
      <View>
        {media && (
          <View style={{ padding: 16 }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ marginBottom: 8 }}>Caption</Text>
              <TextInput
                placeholder="What Up Doe?..."
                value={text}
                onChangeText={(text) => setText(text)}
                style={styles.input}
              />
            </View>
            <Button title="Add Content" onPress={handleAddContent} />
          </View>
        )}
        <AddMedia
          onConvertedMedia={(media) => {
            setMedia(media);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d2e4dd",
    flexDirection: "column",
    borderTopWidth: 1,
    borderColor: "#999",
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
  input: {
    height: 34,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    flexGrow: 1,
    // marginHorizontal: 16,
  },
});

export default AddContentScreen;
