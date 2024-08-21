import React from "react";
import { Text, View } from "react-native";

export const SectionHeader = ({ title, subtitle }) => (
  <View
    style={{
      flex: 1,
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 4,
      marginTop: 0,
      paddingBottom: 4,
      paddingHorizontal: 16,
      backgroundColor: "white",
    }}
  >
    <Text
      style={{
        color: "black",
        fontSize: 24,
        paddingRight: 6,
        fontWeight: "bold",
        textAlign: "left",
        paddingTop: 16,
      }}
    >
      {title}
    </Text>
    {subtitle && (
      <Text
        style={{
          color: "#999",
          fontSize: 16,
          paddingRight: 12,
          fontWeight: "bold",
          textAlign: "left",
          paddingTop: 16,
        }}
      >
        / {subtitle}
      </Text>
    )}
  </View>
);
