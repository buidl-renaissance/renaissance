import React from "react";

import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";

import QRCode from "react-qr-code";

import { darkGrey } from "../colors";

const ShareScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/renaissance.png")}
        resizeMode="cover"
      >
        <Animated.View
          style={{
            paddingTop: 220,
            paddingHorizontal: 32,
            paddingVertical: 220,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderBottomColor: "gray",
            borderBottomWidth: 1,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "left",
              marginTop: 8,
            }}
          >
            Welcome to the Renaissance City
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              textAlign: "left",
              marginVertical: 4,
              marginBottom: 16,
            }}
          >
            Unlock the rich tapestry of food, arts, and events that Detroit has
            to offer.
          </Text>
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
        </Animated.View>
      </ImageBackground>
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
