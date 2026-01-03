import React from "react";
import { Text, View } from "react-native";
import { theme } from "../colors";

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
      backgroundColor: theme.background,
    }}
  >
    <Text
      style={{
        color: theme.text,
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
          color: theme.textSecondary,
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
