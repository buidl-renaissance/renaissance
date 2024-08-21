import React from "react";
import { Text } from "react-native";

export const SectionTitle = (props) => (
  <Text
    style={{
      color: "#999",
      padding: 16,
      fontSize: 18,
      fontWeight: "bold",
      paddingBottom: 0,
    }}
  >
    {props.children}
  </Text>
);
