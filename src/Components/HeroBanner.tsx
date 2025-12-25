import React from "react";
import { Animated, ImageBackground, Text, View } from "react-native";
import { TreasuryBalanceCard } from "./TreasuryBalanceCard";

export const HeroBanner = ({ children }) => {

  return (
    <View>
      <ImageBackground
        source={require("../../assets/renaissance-top-right.png")}
        resizeMode="cover"
      >
        <Animated.View
          style={{
            paddingTop: 160,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderBottomColor: "gray",
            borderBottomWidth: 1,
          }}
        >
          {/* <TreasuryBalanceCard /> */}
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
              marginBottom: 8,
            }}
          >
            Unlock the rich tapestry of food, arts, and culture that Detroit has
            to offer.
          </Text>
          {children}
        </Animated.View>
      </ImageBackground>
    </View>
  );
};
