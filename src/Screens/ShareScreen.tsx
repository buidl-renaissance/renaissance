import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import QRCode from "react-qr-code";

import { darkGrey } from "../colors";
import { HeroBanner } from "../Components/HeroBanner";

const ShareScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  return (
    <View style={styles.container}>
      <HeroBanner>
        <View style={{ position: "relative", height: 150 }}>
          <View
            style={{
              borderColor: "white",
              borderWidth: 5,
              position: "absolute",
            }}
          >
            <QRCode
              value={`https://apps.apple.com/us/app/renaissance-city/id6451351294?platform=iphone`}
              size={140}
            />
          </View>
        </View>
      </HeroBanner>
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

export default ShareScreen;
