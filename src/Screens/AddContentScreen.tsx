import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { darkGrey } from "../colors";
import AddMedia from "../Components/AddMedia";
import { HeaderTitleImage } from "../Components/HeaderTitleImage";

const AddContentScreen = ({ navigation, route }) => {
  const [artwork] = React.useState(route?.params?.artwork ?? null);

  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  return (
    <View style={styles.container}>
      <AddMedia />
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
});

export default AddContentScreen;
