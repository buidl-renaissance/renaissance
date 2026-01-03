import React from "react";
import { Text } from "react-native";
import { theme } from "../colors";

export const SectionTitle = (props) => (
  <Text
    style={{
      color: theme.textSecondary,
      padding: 16,
      fontSize: 18,
      fontWeight: "bold",
      paddingBottom: 0,
    }}
  >
    {props.children}
  </Text>
);
