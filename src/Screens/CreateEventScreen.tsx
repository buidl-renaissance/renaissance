import React from "react";
import { ScrollView, StyleSheet, Image, View } from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { TextInputGroup } from "../Components/TextInputGroup";
import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";

import { lightGreen, darkGrey } from "../colors";

const CreateEventScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [title, onChangeTitle] = React.useState<string>();
  const [desc, onChangeDesc] = React.useState<string>();

  return (
    <View style={styles.container}>
      <ScrollView style={{ padding: 16 }}>
        <TextInputGroup
          label="Title"
          placeholder="Title (required)"
          onChangeText={onChangeTitle}
          value={title}
        />
        <TextInputGroup
          label="Description"
          placeholder="Description (required)"
          onChangeText={onChangeDesc}
          value={desc}
        />
      </ScrollView>
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
});

export default CreateEventScreen;
