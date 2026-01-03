import React from "react";
import { Animated, ImageBackground, Text, View } from "react-native";
import { TreasuryBalanceCard } from "./TreasuryBalanceCard";
import { theme } from "../colors";

export const HeroBanner = ({ children }) => {

  return (
    <View>
      <ImageBackground
        source={require("../../assets/renaissance-right.png")}
        resizeMode="cover"
      >
        <Animated.View
          style={{
            paddingTop: 108,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: theme.overlay,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
          }}
        >
          {/* <TreasuryBalanceCard /> */}
          <Text
            style={{
              color: theme.textOnDark,
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
              color: theme.textOnDark,
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
